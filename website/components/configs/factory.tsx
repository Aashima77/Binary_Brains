import { Button, Card, CardBody, CardHeader, Input, Spinner, addToast } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";

const factorySchema = z.object({
    name: z.string().min(1, "Factory name is required"),
});
type FactoryFormData = z.infer<typeof factorySchema>;
export const AddFactoryForm: React.FC = () => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FactoryFormData>({
        resolver: zodResolver(factorySchema),
    });

    const addFactoryMutation = useMutation({
        mutationFn: async (data: FactoryFormData) => {
            const res = await fetch('/api/configs/factory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to add factory');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['factories'] });
            addToast({
                title: "Factory added successfully",
                color: "success"
            });
            reset();
        },
        onError: () => {
            addToast({
                title: "An Error occurred while adding the factory",
                color: "danger"
            });
        },
    });

    const onSubmit = (data: FactoryFormData) => {
        addFactoryMutation.mutate(data);
    };

    return (
        <Card className="p-6">
            <CardHeader className="font-semibold text-xl">Add New Factory</CardHeader>
            <CardBody>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Input
                            {...register("name")}
                            label="Factory Name"
                            isInvalid={!!errors.name}
                            errorMessage={errors.name?.message}
                            fullWidth
                            variant="bordered"
                            isRequired
                        />
                    </div>
                    <Button type="submit" color="primary" isLoading={isSubmitting || addFactoryMutation.isPending} radius="full" variant="solid">
                        {isSubmitting || addFactoryMutation.isPending ? <></> : <Plus size={18} />} Add Factory
                    </Button>
                </form>
            </CardBody>
        </Card>
    );
};
