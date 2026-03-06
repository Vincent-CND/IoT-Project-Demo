import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import YAML from "yaml";
import { execFile } from "child_process";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

const USE_WSL = false;
const ANSIBLE_CMD = USE_WSL ? "wsl" : "ansible-playbook";

const INVENTORY = path.join(__dirname, "inventory.ini");
const PLAYBOOK = path.join(__dirname, "site.yml");
const VARS_FILE = path.join(__dirname, "vars.yml");

let firstname = null;
let lastname = null;
let message = "success";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "iotproject",
  password: "admin123",
  port: 5432,
});

db.connect()

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
  
  firstname = String(req.body.firstName);
  lastname = String(req.body.lastName);

  const vars = {
    firstName : req.body.firstName,
    lastName : req.body.lastName,
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

  let vlan_List = [];
  let vlanPlay = "";

  if (req.body.vlan_L3 == true) {
    vlan_List.push("L3_switch");
  }

  if (req.body.vlan_layer2_sw1 == true) {
    vlan_List.push("SW1");
  }

  if (req.body.vlan_layer2_sw2 == true) {
    vlan_List.push("SW2");
  }

  console.log("vlan_List: ", vlan_List);
  if (vlan_List.length > 0) {
    const vlanHosts = vlan_List.join(",");
    vlanPlay = `
- name: configure vlan
  hosts: ${vlanHosts}
  gather_facts: no
  collections:
    - cisco.ios

  vars:
    vlan_id: ${req.body.vlan_number}
    vlan_name: ${req.body.vlan_name}
    flag_trunk: ${req.body.flag_trunk}
    flag_assign: ${req.body.flag_assign}
    start_port: ${req.body.start_Assign_Port}
    end_port: ${req.body.end_Assign_Port}

  tasks:
    - name: create vlan
      cisco.ios.ios_config:
        lines:
          - "vlan {{ vlan_id }}"
          - "name {{ vlan_name }}"

    - name: assign vlan to ports
      cisco.ios.ios_config:
        lines: 
          - "interface range f0/{{ start_port }}-{{ end_port }}"
          - "switchport mode access"
          - "switchport access vlan {{ vlan_id }}"
`
}

  // 2) Write vars.yml
  fs.writeFileSync(VARS_FILE, YAML.stringify(vars), "utf8");

const siteYml = `---
- name: configure dhcp  
  hosts: ${req.body.dhcp_user_option.slice(4,req.body.dhcp_user_option.length)}
  gather_facts: no
  collections:
    - cisco.ios
  
  vars:
    dhcp_pool: ${req.body.pool}
    network_dhcp: ${req.body.network_dhcp}
    default_router: ${req.body.default_router}
    ipDHCPexcluded: ${req.body.ipDHCPexcluded}
    dns_server: ${req.body.dnsServer}
    excluded_ip : ${req.body.ipDHCPexcluded}
  
  tasks:
    - name: configure DHCP pool on specific device
      cisco.ios.ios_config:
        parents:
          - "ip dhcp pool {{ dhcp_pool }}"
        lines:
          - "network {{ network_dhcp }} 255.255.255.0"
          - "default-router {{ default_router }}"
          - "dns-server {{ dns_server }}"
          - "ip dhcp excluded-address {{ excluded_ip }}"
  
- name: configure user and secret
  hosts: ${req.body.user_create_option.slice(0,req.body.user_create_option.length)}
  gather_facts: no
  collections:
    - cisco.ios
  
  vars:
    user_name: ${req.body.user_name}
    secret: ${req.body.Secret}
  
  tasks:
    - name: create user and secret on specific device
      cisco.ios.ios_config:
        lines:
          - "username {{ user_name }} privilege 15 secret {{ secret }}"
  
- name: configure ospf
  hosts: ${req.body.ospf_user_option.slice(4,req.body.ospf_user_option.length)}
  gather_facts: no
  collections:
    - cisco.ios
  
  vars:
    ospf_num: ${req.body.ospf_num}
    network_ospf: ${req.body.network_ospf}
    wildcard: ${req.body.wildcard}
    Area: ${req.body.Area}
  
  tasks:
    - name: configure OSPF on specific device
      cisco.ios.ios_config:
        parents:
          - "ip routing"
          - "router ospf {{ ospf_num }}"
        lines:
          - "network {{ network_ospf }} {{ wildcard }} area {{ Area }}"

- name: configure ntp
  hosts: ${req.body.ntp_user_option.slice(3,req.body.ntp_user_option.length)}
  gather_facts: no
  collections:
    - cisco.ios
  
  vars:
    ntp_server: ${req.body.ntp_server}
  
  tasks:
    - name: configure NTP server on specific device
      cisco.ios.ios_config:
        lines:
          - "ntp server ${req.body.ntp_server}"

${vlanPlay}

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

app.get("/fetchdata", async(req,res) => {
  try{
    const insertData = await db.query(`INSERT INTO users_messages(firstname,lastname,message) VALUES($1,$2,$3);`,[firstname,lastname,message])
    const fetchData = await db.query("SELECT * FROM users_messages;")
    res.json(fetchData.rows)
  } catch(error){
    res.status(500).json({error: error.message})
    console.log(error.message)
  }
}
)

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


