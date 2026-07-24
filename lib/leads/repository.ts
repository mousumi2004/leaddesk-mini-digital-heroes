import type {
  LeadRecord,
  LeadStatus,
  NormalizedLeadInput,
} from "@/lib/leads/schema";

export const SERVER_TIMESTAMP = "SERVER_TIMESTAMP" as const;

export type NewLeadWrite = NormalizedLeadInput & {
  status: "new";
  createdAt: typeof SERVER_TIMESTAMP;
  updatedAt: typeof SERVER_TIMESTAMP;
};

export type StatusWrite = {
  status: LeadStatus;
  updatedAt: typeof SERVER_TIMESTAMP;
};

export interface LeadStore {
  add(data: NewLeadWrite): Promise<{ id: string }>;
  list(): Promise<LeadRecord[]>;
  update(id: string, data: StatusWrite): Promise<void>;
}

export function createLeadRepository(store: LeadStore) {
  return {
    create(input: NormalizedLeadInput) {
      return store.add({
        ...input,
        status: "new",
        createdAt: SERVER_TIMESTAMP,
        updatedAt: SERVER_TIMESTAMP,
      });
    },
    list() {
      return store.list();
    },
    updateStatus(id: string, status: LeadStatus) {
      return store.update(id, {
        status,
        updatedAt: SERVER_TIMESTAMP,
      });
    },
  };
}

export type LeadRepository = ReturnType<typeof createLeadRepository>;
