# HPC Work Split Optimizer

> **Optimize task distribution across heterogeneous compute resources to finish jobs faster and reduce idle time.**


---
Available online here - https://didzislauva.github.io/HPCWorkOptimizerCalc/
## ✨ Why you might need this

When you run the **same** workload on machines that **aren’t the same speed**, splitting the work 1 : 1 : 1 wastes time—fast machines finish early and wait for slow ones.  
The **HPC Work Split Optimizer** finds a chunk‑by‑chunk distribution in which **all machines finish at (almost) the same time**, trimming overall wall‑clock time and electricity costs.

---

## 🚀 Quick start

```bash
git clone https://github.com/didzislauva/HPCWorkOptimizerCalc.git
cd HPCWorkOptimizerCalc
open index.html          # or serve with your favourite static server
```

> No build step, no backend, no dependencies—just open it in any modern browser (Chrome ≥ 97, Firefox ≥ 95, Edge ≥ 97).

---

## 🖥️ Using the calculator

1. Click **Add Machine** until every node in your cluster has a row.  
2. Enter each machine’s speed *relative to Machine 1*:
   * `50` → *50 % faster*  
   * `-20` → *20 % slower*  
   * `0` → *same speed*
3. Set **Total computation time for machine 1**  
   (how long the whole job would take *if you ran it only on Machine 1*).
4. *(Optional)* Adjust **Advanced Settings**:
   * **Max chunks** – upper bound on search space (100 ≈ fast; 1000 ≈ thorough)
   * **Max acceptable wait time** – stop early once a good enough balance is found
   * **Ensure all machines get work** – tick if idling *any* node is unacceptable
   * **Debug mode** – prints every candidate split it tests
5. Click **Calculate Optimal Split**.

You’ll get:

```
OPTIMAL WORK DISTRIBUTION
=========================

Total chunks: 28
Maximum completion time: 138.57 minutes
Wait time (fastest ↔ slowest): 0.13 minutes
...
```

A bar chart below visualises **Optimized vs. Equal Distribution** and shows the percentage speed‑up.

---

## 🧠 How does it work?

### 1.  Exhaustive‑Search Model (default)

1. **Normalise speeds** so Machine 1 = 1.0×.  
2. **Divide** the workload into *N* chunks (start at the theoretical minimum, grow until `maxChunks`).  
3. **Enumerate every possible split** of those chunks across *m* machines, respecting  
   *zero‑chunk* and wait‑time constraints.  
4. For each split, compute per‑machine completion times  
![Equation](https://latex.codecogs.com/svg.image?T_i%20=%20\frac{\text{chunks}_i}{N}%20\cdot%20\frac{T_{\text{base}}}{\text{speed}_i})

5. Track the split with the smallest *wait time* (max – min).  
6. **Stop early** as soon as a split beats `maxWaitTime`.

> Complexity grows exponentially with *m* and *N*; that’s why we cap `maxChunks` and offer **early termination**.

### 2.  Fallback Model

If the exhaustive search still hasn’t produced a result (for example, you set an unrealistically low `maxChunks` or the speed ratios are awkward fractions):

1. **Heuristic distribution**  
   * Start with a proportional split based on speed.  
   * Round to integers, then adjust to keep the total at *N*.
2. For ≤ 3 machines or ≤ 32 chunks it may still run a *restricted* exhaustive search to fine‑tune.
3. Continues increasing *N* (up to 200) until it finds a split with an acceptable wait time.

The fallback protects you from the classic “my parameters were too strict, so I got *no answer at all*” problem.

---

## 📚 Examples & demos

| Scenario | Machines | Optimal vs. naïve speed‑up |
|----------|----------|----------------------------|
| Mixed cluster | `100 %`, `+75 %`, `‑30 %` | **⬆ 25 % faster** |
| Two equal, one fast | `100 %`, `100 %`, `+50 %` | **⬆ 15 % faster** |
| Two equal, one slow | `100 %`, `100 %`, `‑50 %` | **⬆ 33 % faster** |

Load these presets from the **Examples & Use Cases** tab and click *Calculate*.

---

## 🛠️ Project layout

```
.
├── index.html            # Main UI
├── assets/
│   ├── css/
│   │   └── style.css     # Simple, responsive styling
│   └── js/
│       └── script.js     # All calculator logic
└── docs/
    └── screenshot.png    # For this README
```

No frameworks, no build tools—ideal for quick audits or embedding in intranet portals.

---


## 🤝 Contributing

Big improvements welcome—especially on:
* Smarter heuristics to shrink the search space
* A pure‑Python backend for non‑browser HPC environments
* UI/UX polishing and dark‑mode

---

## 📄 License

[MIT](LICENSE) © 2025 Didzis Lauva.  
Free to use, modify, and distribute—no warranty.

---

*Made with ❤️ in Latvia.*
