"use client";

import { useEffect } from "react";

import { AlertTriangle, Bug, Home, RefreshCw } from "lucide-react";

import {
  Button, Card, CardBody, CardHeader, Chip, Code, Divider,
} from "@heroui/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    /* eslint-disable no-console */
    console.error(error);
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-danger-50 to-warning-50 p-4"
      style={{
      minHeight:"calc(100vh - 65px)"
    }}
    >
      <Card className="shadow-2xl py-4 w-full max-w-2xl">
        <CardHeader className="flex flex-col items-center gap-2">
          <div className="flex justify-center items-center bg-danger-100 mb-2 p-4 rounded-full">
            <AlertTriangle className="size-8 text-danger-500" />
          </div>
          <h1 className="font-bold text-foreground text-xl">
            Oops! Something went wrong
          </h1>
          <p className="max-w-lg text-default-500 text-sm text-center">
            We apologize for the inconvenience. An unexpected error has occurred
            while processing your request.
          </p>
        </CardHeader>

        <Divider />

        <CardBody className="py-4">
          <div className="space-y-4">
            {/* Error Details */}
            {isDevelopment && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Bug className="size-4 text-warning-500" />
                  <span className="font-medium text-default-700 text-sm">
                    Error Details
                  </span>
                </div>
                <Card className="bg-default-50">
                  <CardBody className="p-2">
                    <Code className="text-sm break-all">
                      {error.message || "Unknown error occurred"}
                    </Code>
                    {error.digest && (
                      <div className="mt-2">
                        <Chip size="sm" variant="flat" color="warning">
                          Error ID: {error.digest}
                        </Chip>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex sm:flex-row flex-col gap-3">
              <Button
                color="primary"
                size="lg"
                startContent={<RefreshCw className="w-5 h-5" />}
                onPress={reset}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button
                variant="bordered"
                size="lg"
                startContent={<Home className="w-5 h-5" />}
                onPress={() => (window.location.href = "/")}
                className="flex-1"
              >
                Home
              </Button>
            </div>

            {/* Help Section */}
            <div className="bg-default-50 p-4 rounded-lg">
              <h3 className="mb-2 font-semibold text-default-700">
                What can you do?
              </h3>
              <ul className="space-y-1 text-default-600 text-sm">
                <li>• Try refreshing the page</li>
                <li>• Check your internet connection</li>
                <li>• Clear your browser cache</li>
                <li>• If the problem persists, please contact support</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}