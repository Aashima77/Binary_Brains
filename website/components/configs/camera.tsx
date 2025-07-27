import { addToast, Button, Card, CardBody, CardHeader, Input, Select, SelectItem, Spinner } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

interface LocationOption {
    id: number;
    factory_id: number;
    location: string;
    factory: string;
}

const cameraSchema = z.object({
    name: z.string().min(1, "Camera name is required"),
    streamUrl: z.url("Invalid URL format"),
    locationId: z.number().int().positive("Location must be selected"),
});
type CameraFormData = z.infer<typeof cameraSchema>;

const fetchLocations = async (): Promise<LocationOption[]> => {
    const res = await fetch(`/api/configs/location`);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch locations');
    }
    return res.json();
};

export const AddCameraForm: React.FC = () => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<CameraFormData>({
        resolver: zodResolver(cameraSchema),
    });

    const { data: locations, isLoading: isLoadingLocations, isError: isErrorLocations, error: locationsError } = useQuery<LocationOption[], Error>({
        queryKey: ['locations'],
        queryFn: () => fetchLocations(),
    });

    const addCameraMutation = useMutation({
        mutationFn: async (data: CameraFormData) => {
            const res = await fetch('/api/configs/camera', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to add camera');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cameras'] });
            addToast({
                title: "Camera added successfully",
                color: "success"
            });
            reset();
        },
        onError: () => {
            addToast({
                title: "An Error occurred while adding the camera",
                color: "danger"
            });
        },
    });

    const onSubmit = (data: CameraFormData) => {
        addCameraMutation.mutate(data);
    };

    return (
        <Card className="p-6">
            <CardHeader className="font-semibold text-xl">Add New Camera</CardHeader>
            <CardBody>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Input
                            {...register("name")}
                            label="Camera Name"
                            isInvalid={!!errors.name}
                            errorMessage={errors.name?.message}
                            fullWidth
                            variant="bordered"
                            isRequired
                        />
                    </div>
                    <div>
                        <Input
                            {...register("streamUrl")}
                            label="Stream URL"
                            isInvalid={!!errors.streamUrl}
                            errorMessage={errors.streamUrl?.message}
                            fullWidth
                            variant="bordered"
                            isRequired
                        />
                    </div>
                    <div>
                        <Controller
                            name="locationId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    label="Select Location"
                                    variant="bordered"
                                    isInvalid={!!errors.locationId}
                                    errorMessage={errors.locationId?.message}
                                    fullWidth
                                    isLoading={isLoadingLocations}
                                    isDisabled={isLoadingLocations || isErrorLocations}
                                    isRequired
                                    selectedKeys={field.value ? [field.value.toString()] : []}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                >
                                    {(locations ?? []).map((location) => (
                                        <SelectItem key={location.id.toString()}>
                                            {`${location.factory} > ${location.location}`}
                                        </SelectItem>
                                    ))}
                                </Select>
                            )}
                        />
                        {isErrorLocations && <p className="mt-1 text-red-500 text-sm">Error loading locations: {locationsError?.message}</p>}
                    </div>
                    <Button type="submit" color="primary" isLoading={isSubmitting || addCameraMutation.isPending} radius="full">
                        {isSubmitting || addCameraMutation.isPending ? <></> : <Plus size={18} />} Add Camera
                    </Button>
                </form>
            </CardBody>
        </Card>
    );
};