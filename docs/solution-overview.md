# 💡 Solution Overview

## What We Built
**Cyber Fraud Network Analyzer (CFNA)** is an evidence-linked investigation platform powered by **IBM watsonx Granite AI** and deterministic graph analytics.

## Core Mechanism
CFNA automatically ingests multi-format fraud intelligence (PDFs, Excel, CSV, JSON, TXT, or whole case folders), extracts key entities (`Person`, `BankAccount`, `Phone`, `SIM`, `Device`, `IP`), and merges them into an interactive evidence graph.

It automatically runs deterministic detection rules to identify:
- **Fan-In / Fan-Out Transfer Networks**
- **Shared Hardware Devices & Shared SIMs**
- **Rapid Transfer / Pass-Through Mule Account Layering**
- **Network Centralities & Louvain Community Clusters**

Investigator questions are answered by **IBM watsonx Granite AI (`ibm/granite-13b-instruct-v2`)** anchored strictly to verified evidence citations (`EV-xxxx`) without hallucination.
