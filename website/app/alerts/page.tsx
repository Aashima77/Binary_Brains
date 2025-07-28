"use client";
import { useQuery } from "@tanstack/react-query";
import {
  Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Chip, Spinner, Badge, Breadcrumbs, BreadcrumbItem, Drawer, DrawerContent,
  DrawerHeader, DrawerBody, DrawerFooter, useDisclosure, Card, CardBody,
} from "@heroui/react";
import { Calendar, MapPin, AlertTriangle, Eye, CheckCircle, Camera, Clock, Building2 } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface Alert {
  id: number;
  timestamp: string;
  type: string;
  description: string;
  camera_name: string;
  location_name: string;
  factory_name: string;
  image: string;
}

const fetchAlerts = async (): Promise<Alert[]> => {
  const res = await fetch("/api/alerts");
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
};

const AlertsPage = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const { data: alerts = [], isLoading, isError, error } = useQuery<Alert[], Error>({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
  });

  const handleViewAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    onOpen();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center"
        style={{
          height: "calc(100vh - 65px)"
        }}
      >
        <Spinner label="Loading violations" color="primary" variant="wave" size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center"
        style={{
          height: "calc(100vh - 65px)"
        }}
      >
        <Chip color="danger" variant="bordered" size="lg">
          Error loading alerts: {error?.message}
        </Chip>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Badge content={alerts.length} size="lg" placement="top-right" shape="circle" color="danger">
        <div className="py-2 pr-6">
          <h1 className="font-bold text-2xl">Violations</h1>
        </div>
      </Badge>

      {/* Alerts Table */}
      <Table
        aria-label="System alerts table"
        className="mt-6"
        removeWrapper
        isStriped
      >
        <TableHeader>
          <TableColumn key="timestamp" className="bg-default-100">
            <div className="flex items-center gap-2 font-semibold">
              <Calendar className="w-4 h-4 text-primary" />
              TIMESTAMP
            </div>
          </TableColumn>
          <TableColumn key="factory" className="bg-default-100">
            <div className="flex items-center gap-2 font-semibold">
              <MapPin className="w-4 h-4 text-primary" />
              CAMERA
            </div>
          </TableColumn>
          <TableColumn key="type" className="bg-default-100">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-primary" />
              ALERT TYPE
            </div>
          </TableColumn>
          <TableColumn key="actions" className="bg-default-100">
            <div className="font-semibold">ACTIONS</div>
          </TableColumn>
        </TableHeader>

        <TableBody emptyContent="No alerts found">
          {alerts.map((alert) => (
            <TableRow key={alert.id} className="hover:bg-default-50">
              <TableCell>
                <div className="font-mono text-default-600 text-sm">
                  {new Date(alert.timestamp).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
              </TableCell>
              <TableCell>
                <Breadcrumbs isDisabled>
                  <BreadcrumbItem>{alert.factory_name}</BreadcrumbItem>
                  <BreadcrumbItem>{alert.location_name}</BreadcrumbItem>
                  <BreadcrumbItem>{alert.camera_name}</BreadcrumbItem>
                </Breadcrumbs>
              </TableCell>
              <TableCell>
                <Chip color="danger" variant="solid" size="sm">
                  <div className="flex items-center gap-2 p-1">
                    <AlertTriangle className="size-4" />
                    {alert.type}
                  </div>
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    color="primary"
                    variant="flat"
                    size="sm"
                    isIconOnly
                    startContent={<Eye className="w-4 h-4" />}
                    onPress={() => handleViewAlert(alert)}
                  />
                  <Button
                    color="success"
                    variant="flat"
                    size="sm"
                    isIconOnly
                    startContent={<CheckCircle className="w-4 h-4" />}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Enhanced Drawer with Violation Details */}
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                <span className="font-bold text-xl">Violation Details</span>
                {selectedAlert && (
                  <Chip color="danger" variant="flat" size="sm">
                    Alert ID: #{selectedAlert.id}
                  </Chip>
                )}
              </DrawerHeader>

              <DrawerBody className="gap-4">
                {selectedAlert && (
                  <>
                    {/* Violation Image */}
                    <Card className="w-full" shadow="sm">
                      <CardBody className="p-0">
                        <Image
                          src={selectedAlert.image}
                          alt={`Violation ${selectedAlert.id} screenshot`}
                          className="w-full h-64 object-cover"
                          width={100}
                          height={100}
                        />
                      </CardBody>
                    </Card>

                    {/* Violation Information Cards */}
                    <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                      <Card shadow="sm">
                        <CardBody className="gap-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-danger" />
                            <span className="font-semibold text-default-600 text-sm">VIOLATION TYPE</span>
                          </div>
                          <Chip color="danger" variant="solid" className="self-start">
                            {selectedAlert.type}
                          </Chip>
                        </CardBody>
                      </Card>

                      <Card shadow="sm">
                        <CardBody className="gap-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-default-600 text-sm">DETECTED AT</span>
                          </div>
                          <p className="font-mono text-sm">
                            {new Date(selectedAlert.timestamp).toLocaleString("en-IN", {
                              weekday: "long",
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: true,
                            })}
                          </p>
                        </CardBody>
                      </Card>

                      <Card shadow="sm">
                        <CardBody className="gap-3">
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-success" />
                            <span className="font-semibold text-default-600 text-sm">CAMERA SOURCE</span>
                          </div>
                          <p className="font-medium text-sm"></p>
                          <Chip color="success" variant="dot" className="self-start">
                            {selectedAlert.camera_name}
                          </Chip>
                        </CardBody>
                      </Card>

                      <Card shadow="sm">
                        <CardBody className="gap-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-warning" />
                            <span className="font-semibold text-default-600 text-sm">LOCATION</span>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium">{selectedAlert.factory_name}</p>
                            <p className="text-default-600">{selectedAlert.location_name}</p>
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  </>
                )}
              </DrawerBody>

              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  variant="bordered"
                >
                  Generate Report
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default AlertsPage;