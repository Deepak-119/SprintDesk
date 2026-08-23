import { useQuery } from '@tanstack/react-query'
import { fetchMockData } from '../api/client'
export const useMockData=()=>useQuery({queryKey:['mock-data'],queryFn:fetchMockData,staleTime:Infinity})
