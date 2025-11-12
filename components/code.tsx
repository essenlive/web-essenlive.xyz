"use client"

import { useEffect, useState } from "react"

interface CodeHighlighterProps {
  codeString: string
  language: string
  className?: string
}

export function CodeHighlighter({ codeString, language, className }: CodeHighlighterProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [SyntaxHighlighter, setSyntaxHighlighter] = useState<any>(null)
  const [styles, setStyles] = useState<any>(null)
  const [languageModule, setLanguageModule] = useState<any>(null)

  // Dynamically import syntax highlighter and dependencies
  useEffect(() => {
    Promise.all([
      import("react-syntax-highlighter").then((mod) => mod.PrismAsyncLight),
      import("react-syntax-highlighter/dist/esm/styles/prism").then((mod) => ({
        atomDark: mod.atomDark,
        coy: mod.coy,
      })),
      import("react-syntax-highlighter/dist/esm/languages/prism/jsx"),
    ]).then(([highlighter, styleModules, jsxLang]) => {
      setSyntaxHighlighter(() => highlighter)
      setStyles(styleModules)
      setLanguageModule(jsxLang.default)
    })
  }, [])

  // Register language when both are loaded
  useEffect(() => {
    if (SyntaxHighlighter && languageModule) {
      SyntaxHighlighter.registerLanguage("jsx", languageModule)
    }
  }, [SyntaxHighlighter, languageModule])

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark")
      setIsDarkMode(isDark)
    }

    checkTheme() // Initial check

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    return () => observer.disconnect() // Cleanup observer on component unmount
  }, [])

  // Show loading state while modules are loading
  if (!SyntaxHighlighter || !styles) {
    return (
      <div className={className}>
        <pre style={{
          marginTop: 0,
          marginRight: 0,
          marginBottom: 0,
          marginLeft: 0,
          padding: "1rem",
          fontSize: "0.875rem",
          lineHeight: "1.5rem",
          borderRadius: "var(--radius)",
          background: isDarkMode ? "#1d1f21" : "#f5f5f5",
        }}>
          <code style={{ fontFamily: "var(--font-mono, monospace)" }}>
            {codeString.trim()}
          </code>
        </pre>
      </div>
    )
  }

  return (
    <div className={className}>
      <SyntaxHighlighter
        language={language}
        style={isDarkMode ? styles.atomDark : styles.coy}
        suppressHydrationWarning
        customStyle={{
          marginTop: 0,
          marginRight: 0,
          marginBottom: 0,
          marginLeft: 0,
          padding: "1rem",
          fontSize: "0.875rem",
          lineHeight: "1.5rem",
          borderRadius: "var(--radius)", // Use shadcn border radius variable
        }}
        codeTagProps={{
          style: {
            fontFamily: "var(--font-mono, monospace)", // Use Tailwind's mono font stack
          },
        }}
      >
        {codeString.trim()}
      </SyntaxHighlighter>
    </div>
  )
}
