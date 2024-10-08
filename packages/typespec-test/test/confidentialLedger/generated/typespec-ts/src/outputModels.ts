// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** Identifier for collections. */
export interface CollectionOutput {
  /** The collection id. */
  readonly collectionId: string;
}

/** Paginated ledger entries returned in response to a query. */
export interface PagedLedgerEntriesOutput {
  /** Array of ledger entries. */
  entries: Array<LedgerEntryOutput>;
  /** State of the ledger query. */
  state: LedgerQueryStateOutput;
  /** Path from which to retrieve the next page of results. */
  nextLink?: string;
}

/** Details about a ledger entry. */
export interface LedgerEntryOutput {
  /** Contents of the ledger entry. */
  contents: string;
  /** The collection id. */
  readonly collectionId: string;
  /** A unique identifier for the state of the ledger. If returned as part of a LedgerEntry, it indicates the state from which the entry was read. */
  readonly transactionId: string;
}

/** A receipt certifying the transaction at the specified id. */
export interface TransactionReceiptOutput {
  /** The receipt contents. */
  receipt: ReceiptContentsOutput;
  /** The state of the ledger query. */
  state: LedgerQueryStateOutput;
  /** The transaction ID. */
  transactionId: string;
}

/** The contents of a receipt. */
export interface ReceiptContentsOutput {}

/** Response returned to a query for the transaction status. */
export interface TransactionStatusOutput {
  /** The transaction state. */
  state: TransactionStateOutput;
  /** The transaction ID. */
  transactionId: string;
}

/** Details about a Confidential ledger user. */
export interface LedgerUserOutput {
  /** The user id, either an AAD object ID or certificate fingerprint. */
  readonly userId: string;
  /** The user's assigned role. */
  assignedRole: LedgerUserRoleOutput;
}

/** State of a ledger query. */
export type LedgerQueryStateOutput = "Loading" | "Ready";
/** Represents the state of the transaction. */
export type TransactionStateOutput = "Committed" | "Pending";
/** Represents an assignable role. */
export type LedgerUserRoleOutput = "Administrator" | "Contributor" | "Reader";
