import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetVoucherPriceProps {
  productType: "STAGE" | "BAPTEME";
  category: string;
  enabled?: boolean;
}

export const useGetVoucherPrice = ({
  productType,
  category,
  enabled = true,
}: UseGetVoucherPriceProps) => {
  const query = useQuery({
    queryKey: ["voucher-price", productType, category],
    queryFn: async () => {
      const response = await client.api.giftvouchers.price[":productType"][
        ":category"
      ].$get({
        param: {
          productType,
          category,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch voucher price");
      }

      const { data } = await response.json();
      return data;
    },
    enabled: enabled && !!productType && !!category,
  });

  return query;
};