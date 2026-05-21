# Checklist GitHub

- [ ] Revisar `.gitignore`.
- [ ] No subir `data/`, `silver/`, `gold/`, `models/`.
- [ ] No subir `.pkl`, `.parquet`, `.nc`.
- [ ] Subir `README.md`, `docs/`, `reports/`, `notebooks/`.
- [ ] Confirmar que no hay secretos ni tokens.

Comandos:

```bash
git status
git add README.md .gitignore docs/ reports/ notebooks/ requirements.txt requirements-mac-m2pro.txt
git commit -m "Add documentation pack"
git push
```
