
document.addEventListener("DOMContentLoaded", function () {

  const assignedCheck = document.getElementById("assignedCheck");
  const assignedBox = document.getElementById("assignedPortsBox");
  const startPort = document.getElementById("startPort");
  const endPort = document.getElementById("endPort");

  // Generate fa0/1 → fa0/24
  for (let i = 1; i <= 24; i++) {
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
  let 

  //DHCP Section
  $("#pool").on("input" , function() {
    pool = $(this).val();
    console.log("pool " ,pool);
  })

  $("#Network").on("input" , function() {
    network = $(this).val();
    console.log("network " ,network);
  })

  $("#defaultRouter").on("input" , function() {
    defaultRouter = $(this).val();
    console.log("default Router " , defaultRouter);
  })

  $("#dnsServer").on("input" , function() {
    dnsServer = $(this).val();
    console.log("dns Server " , dnsServer);
  })

  $("#excluded").on("input" , function() { 
    excluded = $(this).val()
    console.log("excluded" , excluded);
  })


  //********** */

  //VLAN Section
  $("#vlanNum").on("input" , function() { 
    vlanNum = $(this).val()
    console.log("vlan num" , vlanNum);
  })

  $("#vlanName").on("input" , function() { 
    vlanName = $(this).val()
    console.log("vlan name" , vlanName);
  })

  $("#assignedCheck").click( () => {
    flagAssign = !flagAssign
    if (flagAssign === true){
      console.log("got it")

      $("#startPort").on("change", function() {
      startAssignPort = $(this).val();
      console.log("Start Port:", startAssignPort);

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
    console.log(userCreateOption);
  });
  

  $("#userName").on("input" , function() { 
    userName = $(this).val()
    console.log("user name" , userName);
  })

  $("#secret").on("input" , function() { 
    secret = $(this).val()
    console.log("secret" , secret);
  })

  //*****/
  //ospf 
  $("#ospfNum").on("input" , function() { 
    ospfNum = $(this).val()
    console.log("ospf num" , ospfNum);
  })

  $("#wildcard").on("input" , function() { 
    wildcast = $(this).val()
    console.log("wildcast" ,  wildcast);
  })

  $("#network").on("input" , function() { 
    Network = $(this).val()
    console.log("network" , Network);
  })

  $("#area").on("input" , function() { 
    area = $(this).val()
    console.log("area" , area);
  })

  //****/
  //ntp 

  $("#ntpserver").on("input" , function() { 
    ntpServer = $(this).val()
    console.log("ntpserver" , ntpServer);
  })

  //****/

  //deploy button
  // $("#deployBtn").on("click", () => {
  //   console.log("ahihi")
  // })

  $("#deployBtn").click( async function () {
  let totalConfigData = {
    pool : pool,
    network_dhcp : network,
    default_router : defaultRouter,
    ipDHCPexcluded : excluded,
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
    ntp_server : ntpServer
  }  
  const sendData = await axios.post("http://localhost:3000/deploy",totalConfigData)
  
  const repliesData = sendData.data
  console.log(repliesData)
});


})  
