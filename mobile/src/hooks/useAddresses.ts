import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';

const ADDRESSES_KEY = ['users', 'addresses'];

export function useAddresses() {
  return useQuery({
    queryKey: ADDRESSES_KEY,
    queryFn: () => usersApi.getAddresses().then((res) => res.data),
  });
}

function useInvalidateAddresses() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY });
}

export function useAddAddress() {
  const invalidate = useInvalidateAddresses();
  return useMutation({ mutationFn: usersApi.addAddress, onSuccess: invalidate });
}

export function useUpdateAddress() {
  const invalidate = useInvalidateAddresses();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof usersApi.updateAddress>[1] }) =>
      usersApi.updateAddress(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteAddress() {
  const invalidate = useInvalidateAddresses();
  return useMutation({ mutationFn: usersApi.deleteAddress, onSuccess: invalidate });
}

export function useSetDefaultAddress() {
  const invalidate = useInvalidateAddresses();
  return useMutation({ mutationFn: usersApi.setDefaultAddress, onSuccess: invalidate });
}
