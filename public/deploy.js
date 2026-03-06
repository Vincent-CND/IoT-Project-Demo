document.addEventListener("DOMContentLoaded", function () {

  const assignedCheck = document.getElementById("assignedCheck");
  const assignedBox = document.getElementById("assignedPortsBox");
  const startPort = document.getElementById("startPort");
  const endPort = document.getElementById("endPort");

  // Generate fa0/1 → fa0/24
  for (let i = 5; i <= 24; i++) {
    const opt1 = document.createElement("option");
    opt1.value = i;
    opt1.textContent = "fa0/" + i;

    const opt2 = opt1.cloneNode(true);

    startPort.appendChild(opt1);
    endPort.appendChild(opt2);
  }

  // Toggle hiện/ẩn range
  assignedCheck.addEventListener("change", function () {
    if (this.checked) {
      assignedBox.style.display = "flex";
    } else {
      assignedBox.style.display = "none";
    }
  });

});

$(document).ready(() => {

  let pool = null;
  //network for dhcp 
  let network = null;
  let defaultRouter = null;
  let dnsServer = null;
  let excluded = null;
  let vlanNum = null; 
  let vlanName = null ; 
  let userName = null ; 
  let secret = null; 
  let ospfNum = null;
  let wildcast = null;
  //Network for ospf
  let Network = null;
  let area = null;
  let ntpServer = null;
  let flagAssign = false;
  let startAssignPort = null;
  let endAssignPort = null;
  let trunkFlag = false;
  let userCreateOption = null;
  let dhcpUserOption = null;
  let ospfUserOption = null;
  let ntpUserOption = null;
  let vlan_L3 = false;
  let vlan_layer2_sw1 = false;
  let vlan_layer2_sw2 = false;
  let user_First_name = null;
  let user_Last_name = null;


  //DHCP Section
  $("#firstName").on("input", function() {
    user_First_name = $(this).val();
    // console.log("First Name:", user_First_name);
  });

  $("#lastName").on("input", function() {
    user_Last_name = $(this).val();
    // console.log("Last Name:", user_Last_name);
  });

  $("#lastName").on("input", function() {
    user_Last_name = $(this).val();
    // console.log("Last Name:", user_Last_name);
  });

  $("input[name='dhcp']").on("change", function () {
    dhcpUserOption = this.id
    // console.log(dhcpUserOption);
  });

  $("#pool").on("input" , function() {
    pool = $(this).val();
    // console.log("pool " ,pool);
  })

  $("#Network").on("input" , function() {
    network = $(this).val();
    // console.log("network " ,network);
  })

  $("#defaultRouter").on("input" , function() {
    defaultRouter = $(this).val();
    // console.log("default Router " , defaultRouter);
  })

  $("#dnsServer").on("input" , function() {
    dnsServer = $(this).val();
    // console.log("dns Server " , dnsServer);
  })

  $("#excluded").on("input" , function() { 
    excluded = $(this).val()
    // console.log("excluded" , excluded);
  })


  //********** */

  //VLAN Section
  $("#vlanchooseL3_switch").click( () => {
    vlan_L3 = !vlan_L3;
    // console.log("vlan_L3:", vlan_L3);
  })

  $("#vlanchooseSW1").click( () => {
    vlan_layer2_sw1 = !vlan_layer2_sw1;
    // console.log("vlan_layer2_sw1:", vlan_layer2_sw1);
  })

  $("#vlanchooseSW2").click( () => {
    vlan_layer2_sw2 = !vlan_layer2_sw2;
    // console.log("vlan_layer2_sw2:", vlan_layer2_sw2);
  })

  $("#vlanNum").on("input" , function() { 
    vlanNum = $(this).val()
    // console.log("vlan num" , vlanNum);
  })

  $("#vlanName").on("input" , function() { 
    vlanName = $(this).val()
    // console.log("vlan name" , vlanName);
  })

  $("#assignedCheck").click( () => {
    flagAssign = !flagAssign
    if (flagAssign === true){
      // console.log("got it")

      $("#startPort").on("change", function() {
      startAssignPort = $(this).val();
      // console.log("Start Port:", startAssignPort);

      $("#endPort").on("change", function() {
      endAssignPort = $(this).val();
      console.log("End Port:", endAssignPort);});
  });
    } else{
      console.log("nah")
    }
  })

  $("#trunkCheck").click( () => {
    trunkFlag = !trunkFlag
    if(trunkFlag === true){
      console.log("checked")
    } else{
      console.log("unchecked")
    }
  })

  // $("#startPort").on("change", function() {
  //   startAssignPort = $(this).val();
  //   console.log("Start Port:", startAssignPort);
  // });

  // $("#endPort").on("change", function() {
  //   endAssignPort = $(this).val();
  //   console.log("End Port:", endAssignPort);
  // });

  //******** */

  //user create
  $("input[name='device']").on("change", function () {
    userCreateOption = this.id
    // console.log(userCreateOption);
  });
  

  $("#userName").on("input" , function() { 
    userName = $(this).val()
    // console.log("user name" , userName);
  })

  $("#secret").on("input" , function() { 
    secret = $(this).val()
    // console.log("secret" , secret);
  })

  //*****/
  //ospf 
  $("input[name='ospf']").on("change", function () {
    ospfUserOption = this.id
    // console.log(ospfUserOption);
  });

  $("#ospfNum").on("input" , function() { 
    ospfNum = $(this).val()
    // console.log("ospf num" , ospfNum);
  })

  $("#wildcard").on("input" , function() { 
    wildcast = $(this).val()
    // console.log("wildcast" ,  wildcast);
  })

  $("#network").on("input" , function() { 
    Network = $(this).val()
    // console.log("network" , Network);
  })

  $("#area").on("input" , function() { 
    area = $(this).val()
    // console.log("area" , area);
  })

  //****/
  //ntp 

  $("input[name='ntp']").on("change", function () {
    ntpUserOption = this.id
    // console.log(ntpUserOption);
  });

  $("#ntpserver").on("input" , function() { 
    ntpServer = $(this).val()
    // console.log("ntpserver" , ntpServer);
  })

  //****/

  //deploy button
  // $("#deployBtn").on("click", () => {
  //   console.log("ahihi")
  // })

  $("#deployBtn").click( async function () {
  let totalConfigData = {
    firstName : user_First_name,
    lastName : user_Last_name,
    pool : pool,
    network_dhcp : network,
    default_router : defaultRouter,
    ipDHCPexcluded : excluded,
    dnsServer : dnsServer,
    vlan_number : vlanNum,
    vlan_name : vlanName,
    flag_assign : flagAssign,
    flag_trunk : trunkFlag,
    start_Assign_Port: startAssignPort,
    end_Assign_Port : endAssignPort,
    user_create_option : userCreateOption,
    user_name : userName,
    Secret : secret,
    ospf_num : ospfNum,
    wildcard : wildcast,
    network_ospf : Network,
    Area : area,
    ntp_server : ntpServer,
    dhcp_user_option : dhcpUserOption,
    ospf_user_option : ospfUserOption,
    ntp_user_option : ntpUserOption,
    vlan_L3 : vlan_L3,
    vlan_layer2_sw1 : vlan_layer2_sw1,
    vlan_layer2_sw2 : vlan_layer2_sw2
  }  
  const sendData = await axios.post("http://localhost:3000/deploy",totalConfigData)
  
  const repliesData = sendData.data
  console.log(repliesData)

  localStorage.setItem("deployResult", JSON.stringify(repliesData.userdata));
  location.reload();
});

const resultBox = document.getElementById("resultBox");

function renderDatabaseData(userdata) {

  if (!resultBox) return;

  if (!userdata || userdata.length === 0) {
    resultBox.innerHTML = "<p>No data from database</p>";
    return;
  }

  let html = `
  <table style="width:100%; border-collapse:collapse;">
    <thead>
      <tr>
        <th style="border:1px solid #ccc;padding:6px;">ID</th>
        <th style="border:1px solid #ccc;padding:6px;">First Name</th>
        <th style="border:1px solid #ccc;padding:6px;">Last Name</th>
        <th style="border:1px solid #ccc;padding:6px;">Message</th>
        <th style="border:1px solid #ccc;padding:6px;">Time</th>
      </tr>
    </thead>
    <tbody>
  `;

  userdata.forEach(row => {
    html += `
      <tr>
        <td style="border:1px solid #ccc;padding:6px;">${row.id}</td>
        <td style="border:1px solid #ccc;padding:6px;">${row.firstname}</td>
        <td style="border:1px solid #ccc;padding:6px;">${row.lastname}</td>
        <td style="border:1px solid #ccc;padding:6px;">${row.message}</td>
        <td style="border:1px solid #ccc;padding:6px;">${new Date(row.time).toLocaleString()}</td>
      </tr>
    `;
  });

  html += "</tbody></table>";

  resultBox.innerHTML = html;
}

})  
