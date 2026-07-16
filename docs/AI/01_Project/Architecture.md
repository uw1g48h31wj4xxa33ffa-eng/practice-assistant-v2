# Architecture

今回確定した責務境界は以下の通りです。

```text
Practice Assistant V2
→ Document Input Adapter
→ Word Generation Application Service
→ Word Document Engine
→ OutputVerifier
→ DomSerializationVerifier
→ Generation Result DTO
→ Download
```
