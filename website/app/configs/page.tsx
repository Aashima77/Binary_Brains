
"use client";
import { Tabs, Tab } from "@heroui/react";
import { AddFactoryForm } from "@/components/configs/factory";
import { AddLocationForm } from "@/components/configs/location";
import { AddCameraForm } from "@/components/configs/camera";
import { AddWorkerForm } from "@/components/configs/worker";

const ConfigsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="mb-6 font-bold text-3xl">Configurations</h1>
      <Tabs aria-label="Configuration Options" color="primary" variant="solid">
        <Tab
          key="factory"
          title="Factory"
        >
          <AddFactoryForm />
        </Tab>
        <Tab
          key="location"
          title="Location"
        >
          <AddLocationForm />
        </Tab>
        <Tab
          key="camera"
          title="Camera"
        >
          <AddCameraForm />
        </Tab>
        <Tab
          key="worker"
          title="Worker"
        >
          <AddWorkerForm />
        </Tab>
      </Tabs>
    </div>
  );
};

export default ConfigsPage;