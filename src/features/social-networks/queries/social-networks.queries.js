// TanStack Query
import { queryOptions, useQuery } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { socialNetworksAPI } from "../api/social-networks.api";

export const socialNetworksKeys = createQueryKeys("social-networks");

export const socialNetworksQueries = {
  /** All social networks → the social-network array. */
  list: () =>
    queryOptions({
      queryKey: socialNetworksKeys.lists(),
      queryFn: () => socialNetworksAPI.getAll().then((r) => r.data.data),
    }),
};

/**
 * Social networks list.
 *
 * @example
 * const { data: socialNetworks = [], isLoading } = useSocialNetworks();
 */
export const useSocialNetworks = () => useQuery(socialNetworksQueries.list());
