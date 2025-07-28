import { addToast, Button, Card, CardBody, CardHeader, Input, Select, SelectItem, Spinner } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import z from "zod";

const locationSchema = z.object({
    name: z.string().min(1, "Location name is required"),
    factoryId: z.number().int().positive("Factory must be selected"),
});
type LocationFormData = z.infer<typeof locationSchema>;

interface FactoryOption {
    id: number;
    name: string;
}

const fetchFactories = async (): Promise<FactoryOption[]> => {
    const res = await fetch('/api/configs/factory');
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch factories');
    }
    return res.json();
};

export const AddLocationForm: React.FC = () => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<LocationFormData>({
        resolver: zodResolver(locationSchema),
    });

    const { data: factories, isLoading: isLoadingFactories, isError: isErrorFactories, error: factoriesError } = useQuery<FactoryOption[], Error>({
        queryKey: ['factories'],
        queryFn: fetchFactories,
    });

    const addLocationMutation = useMutation({
        mutationFn: async (data: LocationFormData) => {
            const res = await fetch('/api/configs/location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to add location');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] });
            addToast({
                title: "Location added successfully",
                color: "success"
            });
            reset();
        },
        onError: () => {
            addToast({
                title: "An Error occurred while adding the location",
                color: "danger"
            });
        },
    });

    const onSubmit = (data: LocationFormData) => {
        addLocationMutation.mutate(data);
    };

    return (
        <Card className="p-6">
            <CardHeader className="font-semibold text-xl">Add New Location</CardHeader>
            <CardBody>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Input
                            {...register("name")}
                            label="Location Name"
                            isInvalid={!!errors.name}
                            errorMessage={errors.name?.message}
                            fullWidth
                            variant="bordered"
                            isRequired
                        />
                    </div>
                    <div>
                        <Controller
                            name="factoryId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    label="Select Factory"
                                    variant="bordered"
                                    isInvalid={!!errors.factoryId}
                                    errorMessage={errors.factoryId?.message}
                                    fullWidth
                                    isLoading={isLoadingFactories}
                                    isDisabled={isLoadingFactories || isErrorFactories}
                                    isRequired
                                    selectedKeys={field.value ? [field.value.toString()] : []}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                >
                                    {(factories ?? []).map((factory) => (
                                        <SelectItem key={factory.id.toString()} variant="solid" color="primary">
                                            {factory.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                            )}
                        />
                        {isErrorFactories && <p className="mt-1 text-red-500 text-sm">Error loading factories: {factoriesError?.message}</p>}
                    </div>
                    <Button type="submit" color="primary" isLoading={isSubmitting || addLocationMutation.isPending} radius="full" variant="solid">
                        {isSubmitting || addLocationMutation.isPending ? <></> : <Plus size={18} />} Add Location
                    </Button>
                </form>
            </CardBody>
        </Card>
    );
};