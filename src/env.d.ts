/// <reference types="astro/client" />

interface Env {
  KV_ROLLS: KVNamespace;
}

declare namespace App {
  interface Locals {
    runtime?: { env: Env };
  }
}
