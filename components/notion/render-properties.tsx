import { Fragment, type ReactNode } from "react"
import { CleanPageProperties } from "@/lib/types"
import { formatDate, cn } from "@/lib/utils"

/**
 * Turns a Notion property into plain text (or a link).
 * Low-tech rendering: no badges, no icons, no colors — just text.
 */
function propertyValue(propKey: string, propValue: CleanPageProperties[string]): ReactNode {
  if (!propValue || !propValue.value) return null;

  switch (propValue.type) {
    case "checkbox":
      return propValue.value ? propKey : null;

    case "date":
    case "created_time":
    case "last_edited_time":
      return formatDate(propValue.value);

    case "email":
      return <a href={`mailto:${propValue.value}`} className="underline">{propValue.value}</a>;

    case "phone_number":
      return <a href={`tel:${propValue.value}`} className="underline">{propValue.value}</a>;

    case "url":
      return (
        <a href={propValue.value} target="_blank" rel="noopener noreferrer" className="underline break-all">
          {propValue.value.replace(/^https?:\/\//, "")}
        </a>
      );

    case "select":
    case "status":
      return propValue.value.name;

    case "multi_select":
      return propValue.value.length > 0
        ? propValue.value.map((item) => item.name).join(", ")
        : null;

    case "number":
    case "place":
    case "people":
    case "created_by":
    case "last_edited_by":
      return String(propValue.value);

    case "rich_text":
      return propValue.value && propValue.value.length > 0 ? propValue.value : null;

    default:
      return null;
  }
}

interface RenderPropertiesProps {
  properties: CleanPageProperties;
  filterOutTitle?: boolean;
  /** true: a key/value list (project page). false: one inline line (cards, lists). */
  pageLayout?: boolean;
  filterProperties?: string[];
  className?: string;
}

export function RenderProperties({
  properties,
  filterOutTitle = true,
  pageLayout = false,
  filterProperties,
  className
}: RenderPropertiesProps) {
  let displayProperties = Object.entries(properties);

  // Filter out title if requested
  if (filterOutTitle) {
    displayProperties = displayProperties.filter(([, value]) => value.type !== "title");
  }

  // Keep only the requested properties, in the requested order
  if (filterProperties && filterProperties.length > 0) {
    displayProperties = filterProperties
      .map((propKey) => displayProperties.find(([key]) => key === propKey))
      .filter((entry): entry is [string, CleanPageProperties[string]] => entry !== undefined);
  }

  const rendered = displayProperties
    .map(([key, value]) => ({ key, node: propertyValue(key, value) }))
    .filter((p) => p.node !== null && p.node !== "");

  if (rendered.length === 0) return null;

  if (pageLayout) {
    return (
      <dl
        className={cn(
          "grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-x-4 gap-y-1 font-mono text-sm",
          className
        )}
      >
        {rendered.map(({ key, node }) => (
          <Fragment key={key}>
            <dt className="text-muted-foreground lowercase">{key}</dt>
            <dd className="m-0">{node}</dd>
          </Fragment>
        ))}
      </dl>
    );
  }

  return (
    <p className={cn("m-0 font-mono text-xs leading-5 text-muted-foreground", className)}>
      {rendered.map(({ key, node }, index) => (
        <Fragment key={key}>
          {index > 0 && " · "}
          {node}
        </Fragment>
      ))}
    </p>
  );
}
