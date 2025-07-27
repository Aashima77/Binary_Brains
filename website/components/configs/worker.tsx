import { addToast, Button, Card, CardBody, CardHeader, Input, Select, SelectItem, Spinner } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const workerSchema = z.object({
    name: z.string().min(1, "Worker name is required"),
    employeeId: z.string().min(1, "Employee ID is required"),
    department: z.string().min(1, "Employee department is required"),
    factoryId: z.number().int().positive("Factory must be selected"),
});
type WorkerFormData = z.infer<typeof workerSchema>;

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

export const AddWorkerForm: React.FC = () => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<WorkerFormData>({
        resolver: zodResolver(workerSchema),
    });

    const { data: factories, isLoading: isLoadingFactories, isError: isErrorFactories, error: factoriesError } = useQuery<FactoryOption[], Error>({
        queryKey: ['factories'],
        queryFn: fetchFactories,
    });

    const addWorkerMutation = useMutation({
        mutationFn: async (data: WorkerFormData) => {
            const res = await fetch('/api/configs/worker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to add worker');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workers'] });
            addToast({
                title: "Worker added successfully",
                color: "success"
            });
            reset();
        },
        onError: () => {
            addToast({
                title: "An Error occurred while adding the worker",
                color: "danger"
            });
        },
    });

    const onSubmit = (data: WorkerFormData) => {
        addWorkerMutation.mutate(data);
    };

    return (
        <Card className="p-6">
            <CardHeader className="font-semibold text-xl">Add New Worker</CardHeader>
            <CardBody>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Input
                            {...register("name")}
                            variant="bordered"
                            label="Worker Name"
                            isRequired
                            isInvalid={!!errors.name}
                            errorMessage={errors.name?.message}
                            fullWidth
                        />
                    </div>
                    <div>
                        <Input
                            {...register("employeeId")}
                            variant="bordered"
                            isRequired
                            label="Employee ID"
                            isInvalid={!!errors.employeeId}
                            errorMessage={errors.employeeId?.message}
                            fullWidth
                        />
                    </div>
                    <div>
                        <Input
                            {...register("department")}
                            variant="bordered"
                            isRequired
                            label="Department"
                            isInvalid={!!errors.department}
                            errorMessage={errors.department?.message}
                            fullWidth
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
                                        <SelectItem key={factory.id}>
                                            {factory.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                            )}
                        />
                        {isErrorFactories && <p className="mt-1 text-red-500 text-sm">Error loading factories: {factoriesError?.message}</p>}
                    </div>
                    <Button type="submit" color="primary" isLoading={isSubmitting || addWorkerMutation.isPending} radius="full">
                        {isSubmitting || addWorkerMutation.isPending ? <></> : <Plus size={18} />} Add Worker
                    </Button>
                </form>
            </CardBody>
        </Card>
    );
};