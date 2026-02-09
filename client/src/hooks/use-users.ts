import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

// Helper to manually fetch (needed for constructing FaceMatcher inside components)
export async function fetchUsers() {
  const res = await fetch(api.users.list.path);
  if (!res.ok) throw new Error("Failed to fetch users");
  return api.users.list.responses[200].parse(await res.json());
}

export function useUsers() {
  return useQuery({
    queryKey: [api.users.list.path],
    queryFn: fetchUsers,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.users.create.input>) => {
      const res = await fetch(api.users.create.path, {
        method: api.users.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create user");
      }
      return api.users.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      // Manual URL construction since we don't have buildUrl helper in this context yet
      // Assuming straightforward replacement
      const url = api.users.delete.path.replace(":id", id.toString());
      const res = await fetch(url, {
        method: api.users.delete.method,
      });
      if (!res.ok) throw new Error("Failed to delete user");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
    },
  });
}
