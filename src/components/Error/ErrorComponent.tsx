"use client";

import React from "react";
import { Box, Typography, Button } from "@mui/material";

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorComponent: React.FC<ErrorProps> = ({
  message = "An error occurred. Please try again.",
  onRetry,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "400px",
        gap: 2,
        textAlign: "center",
      }}
    >
      <Typography variant="h6" color="error">
        {message}
      </Typography>
      {onRetry && (
        <Button variant="contained" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Box>
  );
};

export default ErrorComponent;
