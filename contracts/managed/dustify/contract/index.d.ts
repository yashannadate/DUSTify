import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  getRelayerSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  getUserSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  initialize(context: __compactRuntime.CircuitContext<PS>,
             adminKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerDApp(context: __compactRuntime.CircuitContext<PS>,
               dAppId_0: Uint8Array,
               initialQuota_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  authorizeRelayer(context: __compactRuntime.CircuitContext<PS>,
                   relayerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeRelayer(context: __compactRuntime.CircuitContext<PS>,
                relayerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  sponsorTransaction(context: __compactRuntime.CircuitContext<PS>,
                     dAppId_0: Uint8Array,
                     userSalt_0: Uint8Array,
                     costUnits_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  sponsorMessage(context: __compactRuntime.CircuitContext<PS>,
                 dAppId_0: Uint8Array,
                 userSalt_0: Uint8Array,
                 customMessage_0: string): __compactRuntime.CircuitResults<PS, []>;
  topUpQuota(context: __compactRuntime.CircuitContext<PS>,
             dAppId_0: Uint8Array,
             additionalQuota_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  advanceEpoch(context: __compactRuntime.CircuitContext<PS>, newEpoch_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  setPaused(context: __compactRuntime.CircuitContext<PS>, paused_0: boolean): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  initialize(context: __compactRuntime.CircuitContext<PS>,
             adminKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerDApp(context: __compactRuntime.CircuitContext<PS>,
               dAppId_0: Uint8Array,
               initialQuota_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  authorizeRelayer(context: __compactRuntime.CircuitContext<PS>,
                   relayerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeRelayer(context: __compactRuntime.CircuitContext<PS>,
                relayerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  sponsorTransaction(context: __compactRuntime.CircuitContext<PS>,
                     dAppId_0: Uint8Array,
                     userSalt_0: Uint8Array,
                     costUnits_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  sponsorMessage(context: __compactRuntime.CircuitContext<PS>,
                 dAppId_0: Uint8Array,
                 userSalt_0: Uint8Array,
                 customMessage_0: string): __compactRuntime.CircuitResults<PS, []>;
  topUpQuota(context: __compactRuntime.CircuitContext<PS>,
             dAppId_0: Uint8Array,
             additionalQuota_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  advanceEpoch(context: __compactRuntime.CircuitContext<PS>, newEpoch_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  setPaused(context: __compactRuntime.CircuitContext<PS>, paused_0: boolean): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  initialize(context: __compactRuntime.CircuitContext<PS>,
             adminKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerDApp(context: __compactRuntime.CircuitContext<PS>,
               dAppId_0: Uint8Array,
               initialQuota_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  authorizeRelayer(context: __compactRuntime.CircuitContext<PS>,
                   relayerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeRelayer(context: __compactRuntime.CircuitContext<PS>,
                relayerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  sponsorTransaction(context: __compactRuntime.CircuitContext<PS>,
                     dAppId_0: Uint8Array,
                     userSalt_0: Uint8Array,
                     costUnits_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  sponsorMessage(context: __compactRuntime.CircuitContext<PS>,
                 dAppId_0: Uint8Array,
                 userSalt_0: Uint8Array,
                 customMessage_0: string): __compactRuntime.CircuitResults<PS, []>;
  topUpQuota(context: __compactRuntime.CircuitContext<PS>,
             dAppId_0: Uint8Array,
             additionalQuota_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  advanceEpoch(context: __compactRuntime.CircuitContext<PS>, newEpoch_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  setPaused(context: __compactRuntime.CircuitContext<PS>, paused_0: boolean): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly admin: Uint8Array;
  readonly isInitialized: boolean;
  readonly isPaused: boolean;
  readonly currentEpoch: bigint;
  readonly globalTotalSponsored: bigint;
  readonly latestMessage: string;
  readonly messageCount: bigint;
  authorizedRelayers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  dAppQuotaLimits: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  dAppRemainingQuota: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  dAppTotalSponsored: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  usedNullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
