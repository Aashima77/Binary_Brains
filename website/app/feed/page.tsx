"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { CheckCircle, XCircle } from "lucide-react";
import {
  BreadcrumbItem, Breadcrumbs, Card, CardBody, CardFooter, Chip, Divider, Input, Spinner
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";

interface Camera {
  id: number;
  name: string;
  status: string;
  factoryId: number;
  factoryName: string;
  locationId: number;
  locationName: string;
}

interface Location {
  id: number;
  name: string;
  cameras: Camera[];
}

interface FrameData {
  annotatedFrame: string;
  cameraId: number;
  labels: string[];
  violation: boolean;
}

const fetchCameras = async (): Promise<Camera[]> => {
  const res = await fetch("/api/feed");
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const data = await res.json();

  const Cameras: Camera[] = [];
  data.forEach((factory: any) => {
    Object.values(factory.locations).forEach((location: any) => {
      location.cameras.forEach((camera: any) => {
        Cameras.push({
          id: camera.id,
          name: camera.name,
          status: camera.status,
          factoryId: factory.id,
          factoryName: factory.name,
          locationId: location.id,
          locationName: location.name,
        });
      });
    });
  });
  return Cameras;
};

export default function Feed() {
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [search, setSearch] = useState("");
  const [frameData, setFrameData] = useState<FrameData | null>(null);

  const { data, isLoading, isError, error } = useQuery<Camera[], Error>({
    queryKey: ["cameraFeeds"],
    queryFn: fetchCameras,
  });

  useEffect(() => {
    if (data && data.length > 0 && !selectedCamera) {
      setSelectedCamera(data[0]);
    }
  }, [data, selectedCamera]);

  useEffect(() => {
    const socket = io();

    socket.on("frameProcessed", (data: FrameData) => {
      if (selectedCamera && data.cameraId === selectedCamera.id) {
        setFrameData(data);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedCamera]);

  const handleCameraSelect = (camera: Camera) => {
    setSelectedCamera(camera);
    setFrameData(null);
  };

  const filteredCameras = !search
    ? data || []
    : data?.filter((cam) =>
      [cam.name, cam.locationName, cam.factoryName]
        .some(field => field.toLowerCase().includes(search.toLowerCase()))
    ) || [];

  // Function to get safety equipment status
  const getSafetyEquipmentStatus = () => {
    if (!frameData?.labels) {
      return {
        vest: { present: false, label: "Unknown" },
        helmet: { present: false, label: "Unknown" },
        mask: { present: false, label: "Unknown" }
      };
    }

    const labels = frameData.labels;

    return {
      vest: {
        present: !labels.includes('no safety vest'),
        label: labels.includes('no safety vest') ? 'No Vest' : 'Vest'
      },
      helmet: {
        present: !labels.includes('no hardhat'),
        label: labels.includes('no hardhat') ? 'No Hardhat' : 'Hardhat'
      },
      mask: {
        present: !labels.includes('no mask'),
        label: labels.includes('no mask') ? 'No Mask' : 'Mask'
      }
    };
  };

  const safetyStatus = getSafetyEquipmentStatus();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center" style={{ height: "calc(100vh - 65px)" }}>
        <Spinner label="Loading camera feeds" color="primary" variant="wave" size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center text-red-500" style={{ height: "calc(100vh - 65px)" }}>
        Error: {error?.message}
      </div>
    );
  }

  if (!selectedCamera) {
    return (
      <div className="flex justify-center items-center" style={{ height: "calc(100vh - 65px)" }}>
        No camera feeds available.
      </div>
    );
  }

  return (
    <div className="flex w-full overflow-hidden" style={{ height: "calc(100vh - 65px)" }}>
      <aside className="flex flex-col p-4 border-r w-72 h-full overflow-y-auto">
        <Input
          variant="bordered"
          className="mb-4"
          placeholder="Search cameras"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          isClearable
          onClear={() => setSearch("")}
        />
        <div className="flex flex-col gap-3">
          {filteredCameras.map((cam) => (
            <Card
              key={cam.id}
              isPressable
              isHoverable
              radius="lg"
              shadow="sm"
              className={`p-1 transition-all duration-200 ${selectedCamera?.id === cam.id ? "border-2 border-blue-500" : "border-2 border-transparent hover:border-gray-300"}`}
              onPress={() => handleCameraSelect(cam)}
            >
              <CardBody className="flex flex-row justify-between">
                <div className="flex flex-col">
                  <span className="font-semibold text-base">{cam.name}</span>
                  <span className="flex flex-col text-gray-500 text-xs">
                    <span>{cam.locationName}</span>
                    <span>{cam.factoryName}</span>
                  </span>
                </div>
                <Chip
                  size="sm"
                  variant="dot"
                  color={cam.status === "active" ? "success" : "default"}
                >
                  {cam.status.charAt(0).toUpperCase() + cam.status.slice(1)}
                </Chip>
              </CardBody>
            </Card>
          ))}
        </div>
      </aside>

      <main className="flex-1 p-6 h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <Breadcrumbs isDisabled>
            <BreadcrumbItem>{selectedCamera.factoryName}</BreadcrumbItem>
            <BreadcrumbItem>{selectedCamera.locationName}</BreadcrumbItem>
            <BreadcrumbItem>{selectedCamera.name}</BreadcrumbItem>
          </Breadcrumbs>
          <div className="flex items-center gap-2">
            <Chip
              color={selectedCamera.status === "active" ? "success" : "default"}
              variant="dot"
            >
              {selectedCamera.status.charAt(0).toUpperCase() +
                selectedCamera.status.slice(1)}
            </Chip>
            {frameData?.violation && (
              <Chip color="danger" variant="flat">
                Safety Violation
              </Chip>
            )}
          </div>
        </div>

        <Card className="w-full h-[600px]" radius="lg" shadow="sm">
          <CardBody className="flex justify-center items-center p-4 h-full">
            {frameData?.annotatedFrame ? (
              <img
                src={`data:image/jpeg;base64,${frameData.annotatedFrame}`}
                alt={`Live feed from ${selectedCamera.name}`}
                className="rounded-lg max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-center">
                <Spinner size="lg" className="mb-4" />
                <p className="text-gray-500 text-lg">
                  Waiting for live feed from {selectedCamera.name}...
                </p>
              </div>
            )}
          </CardBody>
          <Divider />
          <CardFooter className="flex justify-around p-4">
            <Chip
              startContent={safetyStatus.vest.present ? <CheckCircle size={18} /> : <XCircle size={18} />}
              variant="light"
              color={safetyStatus.vest.present ? "success" : "danger"}
            >
              {safetyStatus.vest.label}
            </Chip>
            <Chip
              startContent={safetyStatus.helmet.present ? <CheckCircle size={18} /> : <XCircle size={18} />}
              variant="light"
              color={safetyStatus.helmet.present ? "success" : "danger"}
            >
              {safetyStatus.helmet.label}
            </Chip>
            <Chip
              startContent={safetyStatus.mask.present ? <CheckCircle size={18} /> : <XCircle size={18} />}
              variant="light"
              color={safetyStatus.mask.present ? "success" : "danger"}
            >
              {safetyStatus.mask.label}
            </Chip>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}