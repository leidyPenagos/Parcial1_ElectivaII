import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const depPath = path.join(__dirname, "../resources/departments.json");
const townsPath = path.join(__dirname, "../resources/towns.json");


router.get("/", (req, res) => {
  const departments = JSON.parse(fs.readFileSync(depPath, "utf8"));
  const towns = JSON.parse(fs.readFileSync(townsPath, "utf8"));
  res.render("home", { departments, towns });
});


router.post("/departments/add", (req, res) => {
  const { code, name } = req.body;
  const departments = JSON.parse(fs.readFileSync(depPath, "utf8"));

  departments.push({ code, name });
  fs.writeFileSync(depPath, JSON.stringify(departments, null, 2), "utf8");

  res.redirect("/");
});


router.post("/towns/add", (req, res) => {
  const { code, department, name } = req.body;
  const towns = JSON.parse(fs.readFileSync(townsPath, "utf8"));

  towns.push({ code, department, name });
  fs.writeFileSync(townsPath, JSON.stringify(towns, null, 2), "utf8");

  res.redirect("/");
});


router.post("/towns/edit/:code", (req, res) => {
  const { code } = req.params;
  const { name } = req.body;
  let towns = JSON.parse(fs.readFileSync(townsPath, "utf8"));

  towns = towns.map(t => (t.code === code ? { ...t, name } : t));

  fs.writeFileSync(townsPath, JSON.stringify(towns, null, 2), "utf8");
  res.redirect("/");
});


router.post("/towns/delete/:code", (req, res) => {
  const { code } = req.params;
  let towns = JSON.parse(fs.readFileSync(townsPath, "utf8"));

  towns = towns.filter(t => t.code !== code);

  fs.writeFileSync(townsPath, JSON.stringify(towns, null, 2), "utf8");
  res.redirect("/");
});

router.get("/towns/by-department/:depCode", (req, res) => {
  const { depCode } = req.params;
  const towns = JSON.parse(fs.readFileSync(townsPath, "utf8"));
  const filtered = towns.filter(t => t.department === depCode);
  res.json(filtered);
});

export default router;
