import { Card, CardContent, useTheme } from "@mui/material";

export function BentoContainer({
  children,
  gridColumn,
  gridRow,
}: {
  children: React.ReactNode;
  gridColumn?: string | Record<string, string>;
  gridRow?: string | Record<string, string>;
}) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        gridColumn,
        gridRow,
        height: "100%",
        minWidth: 0,
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "none",
        borderRadius: { xs: 1.75, md: 2 },
        overflow: "hidden",
        position: "relative",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2, md: 2.5 },
          height: "100%",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          "&:last-child": { pb: { xs: 1.5, sm: 2, md: 2.5 } },
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
}
