import '@tanstack/react-query';

/**
 * Messages shown to the user when a query or mutation finishes, see `queryClient.ts`
 */
export interface IQueryMessages {
  successMessage?: string;
  errorMessage?: string;
}

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: IQueryMessages;
    mutationMeta: IQueryMessages;
  }
}
