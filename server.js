//task 1 : dhcp l3 switch or router => option 1 or 2
//task 2 : vlan ( l3 , 2 l2) => option can choose whatever 
//task 3 : ospf : l3 or Router => option 1 or 2
//task 4 : ntp : l3 or Router => option 1 or 2
//task 5 : save the data to database => have a 

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import YAML from "yaml";
import { execFile } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

const USE_WSL = false;
const ANSIBLE_CMD = USE_WSL ? "wsl" : "ansible-playbook";

const INVENTORY = path.join(__dirname, "inventory.ini");
const PLAYBOOK = path.join(__dirname, "site.yml");
const VARS_FILE = path.join(__dirname, "vars.yml");

// Middleware parse body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => { res.render("index.ejs"); }) 
app.get("/main", (req,res) => { res.render("main.ejs") }) 
app.get("/about", (req,res) => { res.render("about.ejs") })

app.post("/deploy", (req, res) => {
  console.log("==> /deploy called");
  console.log("body:", req.body);
  

  console.log("******")
  
  console.log("******")

  
  const vars = {
    pool: req.body.pool_data,
    network_dhcp: req.body.network_dhcp,
    default_router: req.body.default_router,
    dnsServer: req.body.dnsServer,
    ipDHCPexcluded: req.body.ipDHCPexcluded,
    vlan_number: Number(req.body.vlan_number),
    vlan_name: req.body.vlan_name,
    flag_trunk: req.body.flag_trunk === true || req.body.flag_trunk === "true",
    flag_assign: req.body.flag_assign === true || req.body.flag_assign === "true",
    start_Assign_Port: Number(req.body.start_Assign_Port),
    end_Assign_Port: Number(req.body.end_Assign_Port),
    ospf_num: Number(req.body.ospf_num),
    network_ospf: req.body.network_ospf,
    wildcard: req.body.wildcard,
    Area: Number(req.body.Area),
    ntp_server: req.body.ntp_server,
  };

  // 2) Write vars.yml
  fs.writeFileSync(VARS_FILE, YAML.stringify(vars), "utf8");

  // 3) Write site.yml (test local)
//   const siteYml = `---
// - name: Test local machine
//   hosts: local
//   gather_facts: no

//   tasks:
//     - name: Run echo command
//       command: echo "Ansible is working"
//       register: output

//     - name: Show result
//       debug:
//         var: output.stdout
// `;


// const siteYml = `---
// - name: configure dhcp  
//   hosts: ${req.body.dhcp_user_option.slice(4,req.body.dhcp_user_option.length)}
//   gather_facts: no
//   collections:
//     - cisco.ios

//   tasks:
//     - name: collect infos
//       cisco.ios.ios_command:
//         commands:
//           - show version
//           - show ip interface brief
//           - show ip route summary
//           - show cdp neighbors
//           - show spanning-tree summary
//       register: show_output

//     - name: Print output
//       debug:
//         var: show_output.stdout_lines
// `;

const siteYml = `---
- name: configure dhcp  
  hosts: ${req.body.dhcp_user_option.slice(4,req.body.dhcp_user_option.length)}
  gather_facts: no
  collections:
    - cisco.ios
  
  vars:
    dhcp_pool: ${req.body.pool_data}
    network_dhcp: ${req.body.network_dhcp}
    default_router: ${req.body.default_router}
    ipDHCPexcluded: ${req.body.ipDHCPexcluded}
    dns_server: ${req.body.dnsServer}
    excluded_ip : ${req.body.ipDHCPexcluded}
  
  tasks:
    - name: configure DHCP pool on specific device
      cisco.ios.ios_config:
        parents:
          - ip dhcp pool {{ dhcp_pool }}
        lines:

`;
  fs.writeFileSync(PLAYBOOK, siteYml, "utf8");

  // 4) Build args + log
  const args = USE_WSL
    ? ["ansible-playbook", "-i", INVENTORY, PLAYBOOK, "-e", `@${VARS_FILE}`]
    : ["-i", INVENTORY, PLAYBOOK, "-e", `@${VARS_FILE}`];

  console.log("ANSIBLE_CMD:", ANSIBLE_CMD);
  console.log("ARGS:", args);

  // 5) Run ansible
  execFile(ANSIBLE_CMD, args, { cwd: __dirname }, (err, stdout, stderr) => {
    console.log("---- STDOUT ----\n", stdout);
    console.log("---- STDERR ----\n", stderr);

    if (err) {
      console.log("---- ERROR ----\n", err);
      return res.status(500).json({
        ok: false,
        message: "Ansible failed",
        error: err.message,
        stderr,
        stdout,
      });
    }

    return res.json({
      ok: true,
      message: "Deploy success",
      stdout,
      stderr,
    });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});