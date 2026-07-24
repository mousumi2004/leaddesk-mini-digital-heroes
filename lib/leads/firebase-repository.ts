import "server-only";

import { Timestamp, FieldValue } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase/admin";
import {
  createLeadRepository,
  type LeadStore,
  type NewLeadWrite,
  type StatusWrite,
} from "@/lib/leads/repository";
import {
  leadStatuses,
  type LeadRecord,
  type LeadStatus,
} from "@/lib/leads/schema";

function isoDate(value: unknown): string {
  return value instanceof Timestamp
    ? value.toDate().toISOString()
    : new Date(0).toISOString();
}

function isLeadStatus(value: unknown): value is LeadStatus {
  return (
    typeof value === "string" &&
    leadStatuses.includes(value as LeadStatus)
  );
}

const firebaseLeadStore: LeadStore = {
  async add(data: NewLeadWrite) {
    const reference = await getAdminDb()
      .collection("leads")
      .add({
        name: data.name,
        email: data.email,
        budget: data.budget,
        message: data.message,
        status: "new",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

    return { id: reference.id };
  },

  async list() {
    const snapshot = await getAdminDb()
      .collection("leads")
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.flatMap((document) => {
      const data = document.data();
      if (
        typeof data.name !== "string" ||
        typeof data.email !== "string" ||
        typeof data.budget !== "string" ||
        typeof data.message !== "string" ||
        !isLeadStatus(data.status)
      ) {
        return [];
      }

      const lead: LeadRecord = {
        id: document.id,
        name: data.name,
        email: data.email,
        budget: data.budget as LeadRecord["budget"],
        message: data.message,
        status: data.status,
        createdAt: isoDate(data.createdAt),
        updatedAt: isoDate(data.updatedAt),
      };
      return [lead];
    });
  },

  async update(id: string, data: StatusWrite) {
    await getAdminDb().collection("leads").doc(id).update({
      status: data.status,
      updatedAt: FieldValue.serverTimestamp(),
    });
  },
};

export const leadRepository = createLeadRepository(firebaseLeadStore);
