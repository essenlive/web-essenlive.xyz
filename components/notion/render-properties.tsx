import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Link2,
  MapPin,
  Hash
} from "lucide-react"
import { CleanPageProperties } from "@/lib/types"
import { formatDate, cn, notionColorToTailwind } from "@/lib/utils"

interface PropertyDisplayProps {
  propKey: string;
  propValue: CleanPageProperties[string];
}

const PropertyDisplay = ({ propKey, propValue }: PropertyDisplayProps) => {
  
  if (!propValue || !propValue.value ) return null;

  switch (propValue.type) {
    case "checkbox":
      return (
        <div className="flex items-center gap-2 text-sm">
          {propValue.value ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-muted-foreground">{propKey}</span>
        </div>
      );

    case "date":
    case "created_time":
    case "last_edited_time":
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-3 w-3" />
          {/* <span className="text-xs">{propKey}:</span> */}
          <span>{formatDate(propValue.value)}</span>
        </div>
      );

    case "email":
      return (
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-3 w-3 text-muted-foreground" />
          <a
            href={`mailto:${propValue.value}`}
            className="text-primary hover:underline text-xs"
          >
            {propValue.value}
          </a>
        </div>
      );

    case "phone_number":
      return (
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-3 w-3 text-muted-foreground" />
          <a
            href={`tel:${propValue.value}`}
            className="text-primary hover:underline text-xs"
          >
            {propValue.value}
          </a>
        </div>
      );

    case "url":
      return (
        <div className="flex items-center gap-2 text-sm">
          <Link2 className="h-3 w-3 text-muted-foreground" />
          <a
            href={propValue.value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-xs truncate"
          >
            {propValue.value}
          </a>
        </div>
      );

    case "place":
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="text-xs">{propValue.value}</span>
        </div>
      );

    case "number":
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Hash className="h-3 w-3" />
          <span className="text-xs">{propKey}:</span>
          <span className="font-medium">{propValue.value}</span>
        </div>
      );

    case "select":
    case "status":
      return (
        <Badge
          variant="secondary"
          className={cn("text-xs", notionColorToTailwind(propValue.value.color))}
        >
          {propValue.value.name}
        </Badge>
      );

    case "multi_select":
      return (
        <div className="flex flex-wrap gap-1">
          {propValue.value.slice(0, 3).map((item, index) => (
            <Badge
              key={index}
              variant="secondary"
              className={cn("text-xs", notionColorToTailwind(item.color))}
            >
              {item.name}
            </Badge>
          ))}
          {propValue.value.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{propValue.value.length - 3}
            </Badge>
          )}
        </div>
      );

    case "people":
    case "created_by":
    case "last_edited_by":
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {propValue.value.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{propValue.value}</span>
        </div>
      );

    case "rich_text":
      if (propValue.value && propValue.value.length > 0) {
        return (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {JSON.stringify(propValue.value)}
          </p>
        );
      }
      return null;

    default:
      return null;
  }
};
  

interface RenderPropertiesProps {
  properties: CleanPageProperties;
  filterOutTitle?: boolean;
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
  console.log(displayProperties);

  // Filter out title if requested
  if (filterOutTitle) {
    displayProperties = displayProperties.filter(([, value]) => value.type !== "title");
  }

  // Filter to only include specific properties if filterProperties is provided
  // and order them according to the filterProperties array
  if (filterProperties && filterProperties.length > 0) {
    displayProperties = filterProperties
      .map((propKey) => {
        const entry = displayProperties.find(([key]) => key === propKey);
        return entry;
      })
      .filter((entry): entry is [string, CleanPageProperties[string]] => entry !== undefined);
  }

  if (displayProperties.length === 0) return null;

  return (
    <div
      className={cn(
        pageLayout && "grid grid-cols-2",
        !pageLayout && "flex flex-col",
        "gap-2",
        className
      )}
    >
      {displayProperties.map(([key, value], index) => (
        <div
          key={key}
          className={cn(
            "flex",
            pageLayout && (index % 2 === 0 ? "justify-start" : "justify-end") 
          )}
        >
          <PropertyDisplay propKey={key} propValue={value} />
        </div>
      ))}
    </div>
  );
}
