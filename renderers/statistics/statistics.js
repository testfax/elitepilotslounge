let myClassSave = null;
const windowLoaded = new Promise(resolve => { window.onload = resolve; });
windowLoaded.then(() => { myClassSave = new ClassSave('statisticsData'); });

//! DECLARE The Event!
const event = "Statistics"
const runSizeDivs = [
  'statisticsData'
]
let data = getEventFromStore(event); 
//FUNCTIONS FROM CLICKING
window.addEventListener("click", clickedEvent);
function clickedEvent(evt) {
  //Use arraySearch(f) to parse through something your looking for in an array or if you are comparing multiple arrays. 
  //    Combines forEach and find loop methods.
  //    In this parent function, we are only selecting one item to look for, which we will put in an array anyways for the 
  //        arraySearch() function to properly work.
  const clickedEvent = [evt.target.getAttribute('id')]
  const nonUiEvents = []
  const events = arraySearch(nonUiEvents,clickedEvent)
  if (events.found.length) {
    // if (evt.target.hasAttribute('getbutton')) { myClassSave.showAll(); }
  }
  else {
    drop(clickedEvent[0]) //review function for HTML class requirements.
    sizeDivs(runSizeDivs,tallestElement = [],2);
  }
}






//Gets data from electron-store.
if (data) { innerStuff(); }
//Gets data from event handler. (real time data)
ipcRenderer.on('Statistics', (data) => { innerStuff(); });


function innerStuff() {
  //Bank Account
  document.getElementById('Current_Wealth').innerText = "Current Wealth: \n" + data.Bank_Account.Current_Wealth.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Spent_On_Ships').innerText = "Spent on Ships: \n" + data.Bank_Account.Spent_On_Ships.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Spent_On_Outfitting').innerText = "Spent On Outfitting:\n" + data.Bank_Account.Spent_On_Outfitting.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Spent_On_Repairs').innerText = "Spent On Repairs:\n" + data.Bank_Account.Spent_On_Repairs.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Spent_On_Fuel').innerText = "Spent On Fuel:\n" + data.Bank_Account.Spent_On_Fuel.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Spent_On_Ammo_Consumables').innerText = "Spent On Ammo Consumables:\n" + data.Bank_Account.Spent_On_Ammo_Consumables.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Insurance_Claims').innerText = "Insurance Claims:\n" + data.Bank_Account.Insurance_Claims.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Spent_On_Insurance').innerText = "Spent_On_Insurance:\n" + data.Bank_Account.Spent_On_Insurance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Owned_Ship_Count').innerText = "Owned Ship Count:\n" + data.Bank_Account.Owned_Ship_Count.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Spent_On_Suits').innerText = "Spent On Suits:\n" + data.Bank_Account.Spent_On_Suits.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Spent_On_Weapons').innerText = "Spent On Weapons:\n" + data.Bank_Account.Spent_On_Weapons.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Spent_On_Suit_Consumables').innerText = "Spent On Suit Consumables:\n" + data.Bank_Account.Spent_On_Suit_Consumables.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Suits_Owned').innerText = "Suits Owned:\n" + data.Bank_Account.Suits_Owned.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Weapons_Owned').innerText = "Weapons Owned:\n" + data.Bank_Account.Weapons_Owned.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Spent_On_Premium_Stock').innerText = "Spent On Premium Stock:\n" + data.Bank_Account.Spent_On_Premium_Stock.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Premium_Stock_Bought').innerText = "Premium Stock Bought:\n" + data.Bank_Account.Premium_Stock_Bought.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });  
  //Combat
  document.getElementById('Bounties_Claimed').innerText = "Bounties Claimed:\n" + data.Combat.Bounties_Claimed.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Bounty_Hunting_Profit').innerText = "Bounty Hunting Profit:\n" + data.Combat.Bounty_Hunting_Profit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Combat_Bonds').innerText = "Combat Bonds:\n" + data.Combat.Combat_Bonds.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Combat_Bond_Profits').innerText = "Combat Bond Profits:\n" + data.Combat.Combat_Bond_Profits.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Assassinations').innerText = "Assassinations:\n" + data.Combat.Assassinations.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Assassination_Profits').innerText = "Assassination Profits:\n" + data.Combat.Assassination_Profits.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Highest_Single_Reward').innerText = "Highest Single Reward:\n" + data.Combat.Highest_Single_Reward.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Skimmers_Killed').innerText = "Skimmers Killed:\n" + data.Combat.Skimmers_Killed.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('OnFoot_Combat_Bonds').innerText = "On foot Combat Bonds:\n" + data.Combat.OnFoot_Combat_Bonds.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('OnFoot_Combat_Bonds_Profits').innerText = "On Foot Combat Bond Profits:\n" + data.Combat.OnFoot_Combat_Bonds_Profits.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('OnFoot_Vehicles_Destroyed').innerText = "On Foot Vehicles Destroyed:\n" + data.Combat.OnFoot_Vehicles_Destroyed.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('OnFoot_Ships_Destroyed').innerText = "On Foot Ships Destroyed:\n" + data.Combat.OnFoot_Ships_Destroyed.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Dropships_Taken').innerText = "Dropships Taken:\n" + data.Combat.Dropships_Taken.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Dropships_Booked').innerText = "Dropships Booked:\n" + data.Combat.Dropships_Booked.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Dropships_Cancelled').innerText = "Dropships Cancelled:\n" + data.Combat.Dropships_Cancelled.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('ConflictZone_High').innerText = "High Conflict Zones Participated:\n" + data.Combat.ConflictZone_High.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('ConflictZone_Medium').innerText = "Medium Conflict Zones Participated:\n" + data.Combat.ConflictZone_Medium.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('ConflictZone_Low').innerText = "Low Conflict Zones Participated:\n" + data.Combat.ConflictZone_Low.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('ConflictZone_Total').innerText = "Conflict Zone Total:\n" + data.Combat.ConflictZone_Total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('ConflictZone_High_Wins').innerText = "High Conflict Zone Wins:\n" + data.Combat.ConflictZone_High_Wins.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('ConflictZone_Medium_Wins').innerText = "Medium Conflict Zone Wins:\n" + data.Combat.ConflictZone_Medium_Wins.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('ConflictZone_Low_Wins').innerText = "Low Conflict Zone Wins:\n" + data.Combat.ConflictZone_Low_Wins.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('ConflictZone_Total_Wins').innerText = "Conflict Zone Total Wins:\n" + data.Combat.ConflictZone_Total_Wins.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Settlement_Defended').innerText = "Settlements Defended:\n" + data.Combat.Settlement_Defended.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Settlement_Conquered').innerText = "Settlements Conquered:\n" + data.Combat.Settlement_Conquered.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('OnFoot_Skimmers_Killed').innerText = "On Foot Skimmers Killed:\n" + data.Combat.OnFoot_Skimmers_Killed.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('OnFoot_Scavs_Killed').innerText = "On Foot Scavs Killed:\n" + data.Combat.OnFoot_Scavs_Killed.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  //Crime
  document.getElementById('Notoriety').innerText = "Notoriety:\n" + data.Crime.Notoriety.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Fines').innerText = "Fines:\n" + data.Crime.Fines.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Total_Fines').innerText = "Total Fines:\n" + data.Crime.Total_Fines.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Bounties_Received').innerText = "Bounties Received:\n" + data.Crime.Bounties_Received.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Total_Bounties').innerText = "Total Bounties:\n" + data.Crime.Total_Bounties.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Highest_Bounty').innerText = "Highest Bounty:\n" + data.Crime.Highest_Bounty.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Malware_Uploaded').innerText = "Malware Uploaded:\n" + data.Crime.Malware_Uploaded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Settlements_State_Shutdown').innerText = "Settlements State Shutdown:\n" + data.Crime.Settlements_State_Shutdown.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Production_Sabotage').innerText = "Production Sabotage:\n" + data.Crime.Production_Sabotage.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Production_Theft').innerText = "Production Theft:\n" + data.Crime.Production_Theft.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Total_Murders').innerText = "Total Murders:\n" + data.Crime.Total_Murders.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Citizens_Murdered').innerText = "Citizens Murdered:\n" + data.Crime.Citizens_Murdered.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Omnipol_Murdered').innerText = "Omnipol Murdered:\n" + data.Crime.Omnipol_Murdered.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Guards_Murdered').innerText = "Guards Murdered:\n" + data.Crime.Guards_Murdered.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Data_Stolen').innerText = "Data Stolen:\n" + data.Crime.Data_Stolen.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Goods_Stolen').innerText = "Goods Stolen:\n" + data.Crime.Goods_Stolen.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Sample_Stolen').innerText = "Sample Stolen:\n" + data.Crime.Sample_Stolen.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Total_Stolen').innerText = "Total Stolen:\n" + data.Crime.Total_Stolen.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Turrets_Destroyed').innerText = "Turrets Destroyed:\n" + data.Crime.Turrets_Destroyed.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Turrets_Overloaded').innerText = "Turrets Overloaded:\n" + data.Crime.Turrets_Overloaded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Turrets_Total').innerText = "Turrets Total:\n" + data.Crime.Turrets_Total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Value_Stolen_StateChange').innerText = "Value Stolen State Change:\n" + data.Crime.Value_Stolen_StateChange.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Profiles_Cloned').innerText = "Profiles Cloned:\n" + data.Crime.Profiles_Cloned.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  //Smuggling
  document.getElementById('Black_Markets_Traded_With').innerText = "Black Markets Traded With:\n" + data.Smuggling.Black_Markets_Traded_With.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Black_Markets_Profits').innerText = "Black Markets Profits:\n" + data.Smuggling.Black_Markets_Profits.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Black_Markets_Profits').innerText = "Black Markets Profits:\n" + data.Smuggling.Black_Markets_Profits.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Resources_Smuggled').innerText = "Resources muggled:\n" + data.Smuggling.Resources_Smuggled.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Average_Profit1').innerText = "Average Profit:\n" + data.Smuggling.Average_Profit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Highest_Single_Transaction1').innerText = "Highest Single Transaction:\n" + data.Smuggling.Highest_Single_Transaction.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  //Trading
  document.getElementById('Markets_Traded_With').innerText = "Markets Traded With:\n" + data.Trading.Markets_Traded_With.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Market_Profits').innerText = "Market Profits:\n" + data.Trading.Market_Profits.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Resources_Traded').innerText = "Resources Traded:\n" + data.Trading.Resources_Traded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Average_Profit').innerText = "Average Profit:\n" + data.Trading.Average_Profit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Highest_Single_Transaction').innerText = "Highest Single Transaction:\n" + data.Trading.Highest_Single_Transaction.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Data_Sold').innerText = "Data Sold:\n" + data.Trading.Data_Sold.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Goods_Sold').innerText = "Goods Sold:\n" + data.Trading.Goods_Sold.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Assets_Sold').innerText = "Assets Sold:\n" + data.Trading.Assets_Sold.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  //Mining
  document.getElementById('Mining_Profits').innerText = "Mining_Profits:\n" + data.Mining.Mining_Profits.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Quantity_Mined').innerText = "Quantity_Mined:\n" + data.Mining.Quantity_Mined.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Materials_Collected').innerText = "Materials_Collected:\n" + data.Mining.Materials_Collected.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  //Exploration
  document.getElementById('Systems_Visited').innerText = "Systems Visited:\n" + data.Exploration.Systems_Visited.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Exploration_Profits').innerText = "Exploration Profits:\n" + data.Exploration.Exploration_Profits.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Planets_Scanned_To_Level_2').innerText = "Planets Scanned To Level 2:\n" + data.Exploration.Planets_Scanned_To_Level_2.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Planets_Scanned_To_Level_3').innerText = "Planets Scanned To Level 3:\n" + data.Exploration.Planets_Scanned_To_Level_3.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Efficient_Scans').innerText = "Efficient Scans:\n" + data.Exploration.Efficient_Scans.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Highest_Payout').innerText = "Highest Payout:\n" + data.Exploration.Highest_Payout.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Total_Hyperspace_Distance').innerText = "Total Hyperspace Distance:\n" + data.Exploration.Total_Hyperspace_Distance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Total_Hyperspace_Jumps').innerText = "Total Hyperspace Jumps:\n" + data.Exploration.Total_Hyperspace_Jumps.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Greatest_Distance_From_Start').innerText = "Greatest Distance From Start:\n" + data.Exploration.Greatest_Distance_From_Start.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Time_Played').innerText = "Time Played:\n" + data.Exploration.Time_Played.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('OnFoot_Distance_Travelled').innerText = "OnFoot Distance Travelled:\n" + data.Exploration.OnFoot_Distance_Travelled.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Shuttle_Journeys').innerText = "Shuttle Journeys:\n" + data.Exploration.Shuttle_Journeys.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Shuttle_Distance_Travelled').innerText = "Shuttle Distance Travelled:\n" + data.Exploration.Shuttle_Distance_Travelled.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Spent_On_Shuttles').innerText = "Spent On Shuttles:\n" + data.Exploration.Spent_On_Shuttles.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('First_Footfalls').innerText = "First Footfalls:\n" + data.Exploration.First_Footfalls.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Planet_Footfalls').innerText = "Planet Footfalls:\n" + data.Exploration.Planet_Footfalls.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Settlements_Visited').innerText = "Settlements Visited:\n" + data.Exploration.Settlements_Visited.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  //Passengers
  document.getElementById('Passengers_Missions_Accepted').innerText = "Passengers Missions Accepted:\n" + data.Passengers.Passengers_Missions_Accepted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Passengers_Missions_Disgruntled').innerText = "Passengers Missions Disgruntled:\n" + data.Passengers.Passengers_Missions_Disgruntled.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Passengers_Missions_Bulk').innerText = "Passengers Missions Bulk:\n" + data.Passengers.Passengers_Missions_Bulk.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Passengers_Missions_VIP').innerText = "Passengers Missions VIP:\n" + data.Passengers.Passengers_Missions_VIP.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Passengers_Missions_Delivered').innerText = "Passengers Missions Delivered:\n" + data.Passengers.Passengers_Missions_Delivered.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Passengers_Missions_Ejected').innerText = "Passengers Missions Ejected:\n" + data.Passengers.Passengers_Missions_Ejected.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  //Search_And_Rescue
  document.getElementById('SearchRescue_Traded').innerText = "SearchRescue Traded:\n" + data.Search_And_Rescue.SearchRescue_Traded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('SearchRescue_Profit').innerText = "SearchRescue Profit:\n" + data.Search_And_Rescue.SearchRescue_Profit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('SearchRescue_Count').innerText = "SearchRescue Count:\n" + data.Search_And_Rescue.SearchRescue_Count.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Salvage_Legal_POI').innerText = "Salvage Legal POI:\n" + data.Search_And_Rescue.Salvage_Legal_POI.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Salvage_Legal_Settlements').innerText = "Salvage Legal Settlements:\n" + data.Search_And_Rescue.Salvage_Legal_Settlements.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Salvage_Illegal_POI').innerText = "Salvage Illegal POI:\n" + data.Search_And_Rescue.Salvage_Illegal_POI.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Salvage_Illegal_Settlements').innerText = "Salvage Illegal Settlements:\n" + data.Search_And_Rescue.Salvage_Illegal_Settlements.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Maglocks_Opened').innerText = "Maglocks Opened:\n" + data.Search_And_Rescue.Maglocks_Opened.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Panels_Opened').innerText = "Panels Opened:\n" + data.Search_And_Rescue.Panels_Opened.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Settlements_State_FireOut').innerText = "Settlements State FireOut:\n" + data.Search_And_Rescue.Settlements_State_FireOut.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Settlements_State_Reboot').innerText = "Settlements State Reboot:\n" + data.Search_And_Rescue.Settlements_State_Reboot.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  //Encounters
  document.getElementById('TG_ENCOUNTER_KILLED').innerText = "Thargoids Killed:\n" + data.TG_ENCOUNTERS.TG_ENCOUNTER_KILLED.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('TG_ENCOUNTER_TOTAL').innerText = "Thargoid Encounters:\n" + data.TG_ENCOUNTERS.TG_ENCOUNTER_TOTAL.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('TG_ENCOUNTER_TOTAL_LAST_SHIP').innerText = "Thargoid Last Ship Used:\n" + data.TG_ENCOUNTERS.TG_ENCOUNTER_TOTAL_LAST_SHIP
  document.getElementById('TG_ENCOUNTER_TOTAL_LAST_SYSTEM').innerText = "Thargoid Encounter Last System:\n" + data.TG_ENCOUNTERS.TG_ENCOUNTER_TOTAL_LAST_SYSTEM
  document.getElementById('TG_ENCOUNTER_TOTAL_LAST_TIMESTAMP').innerText = "Thargoid Date/Time:\n" + data.TG_ENCOUNTERS.TG_ENCOUNTER_TOTAL_LAST_TIMESTAMP
  document.getElementById('TG_ENCOUNTER_WAKES').innerText = "Thargoid Wakes:\n" + data.TG_ENCOUNTERS.TG_ENCOUNTER_WAKES.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  //Crafting
  document.getElementById('Count_Of_Used_Engineers').innerText = "Count Of Used Engineers:\n" + data.Crafting.Count_Of_Used_Engineers.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Recipes_Generated').innerText = "Recipes Generated:\n" + data.Crafting.Recipes_Generated.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Recipes_Generated_Rank_1').innerText = "Recipes Generated Rank 1:\n" + data.Crafting.Recipes_Generated_Rank_1.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Recipes_Generated_Rank_2').innerText = "Recipes Generated Rank 2:\n" + data.Crafting.Recipes_Generated_Rank_2.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Recipes_Generated_Rank_3').innerText = "Recipes Generated Rank 3:\n" + data.Crafting.Recipes_Generated_Rank_3.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Recipes_Generated_Rank_4').innerText = "Recipes Generated Rank 4:\n" + data.Crafting.Recipes_Generated_Rank_4.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Recipes_Generated_Rank_5').innerText = "Recipes Generated Rank 5:\n" + data.Crafting.Recipes_Generated_Rank_5.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Suit_Mods_Applied').innerText = "Suit Mods Applied:\n" + data.Crafting.Suit_Mods_Applied.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Weapon_Mods_Applied').innerText = "Weapon Mods Applied:\n" + data.Crafting.Weapon_Mods_Applied.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Suits_Upgraded').innerText = "Suits Upgraded:\n" + data.Crafting.Suits_Upgraded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Weapons_Upgraded').innerText = "Weapons Upgraded:\n" + data.Crafting.Weapons_Upgraded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Suits_Upgraded_Full').innerText = "Suits Upgraded Full:\n" + data.Crafting.Suits_Upgraded_Full.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Weapons_Upgraded_Full').innerText = "Weapons Upgraded Full:\n" + data.Crafting.Weapons_Upgraded_Full.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Suit_Mods_Applied_Full').innerText = "Suit Mods Applied Full:\n" + data.Crafting.Suit_Mods_Applied_Full.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Weapon_Mods_Applied_Full').innerText = "Weapon Mods Applied Full:\n" + data.Crafting.Weapon_Mods_Applied_Full.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  //Crew
  document.getElementById('NpcCrew_TotalWages').innerText = "NPC Crew TotalWages:\n" + data.Crew.NpcCrew_TotalWages.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('NpcCrew_Hired').innerText = "NPC Crew Hired:\n" + data.Crew.NpcCrew_Hired.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('NpcCrew_Fired').innerText = "NPC Crew_Fired:\n" + data.Crew.NpcCrew_Fired.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('NpcCrew_Died').innerText = "NPC Crew_Died:\n" + data.Crew.NpcCrew_Died.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  //Multicrew
  document.getElementById('Multicrew_Time_Total').innerText = "Multicrew Time Total:\n" + data.Multicrew.Multicrew_Time_Total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Multicrew_Gunner_Time_Total').innerText = "Multicrew Gunner Time Total:\n" + data.Multicrew.Multicrew_Gunner_Time_Total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Multicrew_Fighter_Time_Total').innerText = "Multicrew Fighter Time Total:\n" + data.Multicrew.Multicrew_Fighter_Time_Total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Multicrew_Credits_Total').innerText = "Multicrew Credits Total:\n" + data.Multicrew.Multicrew_Credits_Total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Multicrew_Fines_Total').innerText = "Multicrew Fines Total:\n" + data.Multicrew.Multicrew_Fines_Total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  //Material_Trader_Stats
  document.getElementById('Trades_Completed').innerText = "Trades_Completed:\n" + data.Material_Trader_Stats.Trades_Completed.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Materials_Traded').innerText = "Materials_Traded:\n" + data.Material_Trader_Stats.Materials_Traded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Encoded_Materials_Traded').innerText = "Encoded_Materials_Traded:\n" + data.Material_Trader_Stats.Encoded_Materials_Traded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Raw_Materials_Traded').innerText = "Raw_Materials_Traded:\n" + data.Material_Trader_Stats.Raw_Materials_Traded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Grade_1_Materials_Traded').innerText = "Grade 1 Materials Traded:\n" + data.Material_Trader_Stats.Grade_1_Materials_Traded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Grade_2_Materials_Traded').innerText = "Grade 2 Materials Traded:\n" + data.Material_Trader_Stats.Grade_2_Materials_Traded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Grade_3_Materials_Traded').innerText = "Grade 3 Materials Traded:\n" + data.Material_Trader_Stats.Grade_3_Materials_Traded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Grade_4_Materials_Traded').innerText = "Grade 4 Materials Traded:\n" + data.Material_Trader_Stats.Grade_4_Materials_Traded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Grade_5_Materials_Traded').innerText = "Grade 5 Materials Traded:\n" + data.Material_Trader_Stats.Grade_5_Materials_Traded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Assets_Traded_In').innerText = "Assets_Traded_In:\n" + data.Material_Trader_Stats.Assets_Traded_In.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Assets_Traded_Out').innerText = "Assets_Traded_Out:\n" + data.Material_Trader_Stats.Assets_Traded_Out.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  //CQC
  document.getElementById('CQC_Credits_Earned').innerText = "CQC_Credits_Earned:\n" + data.CQC.CQC_Credits_Earned.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('CQC_Time_Played').innerText = "CQC_Time_Played:\n" + data.CQC.CQC_Time_Played.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('CQC_KD').innerText = "CQC_KD:\n" + data.CQC.CQC_KD.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('CQC_Kills').innerText = "CQC_Kills:\n" + data.CQC.CQC_Kills.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('CQC_WL').innerText = "CQC_WL:\n" + data.CQC.CQC_WL.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  //FLEETCARRIER
  document.getElementById('FLEETCARRIER_EXPORT_TOTAL').innerText = "Export Total:\n" + data.FLEETCARRIER.FLEETCARRIER_EXPORT_TOTAL.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('FLEETCARRIER_IMPORT_TOTAL').innerText = "Import Total:\n" + data.FLEETCARRIER.FLEETCARRIER_IMPORT_TOTAL.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('FLEETCARRIER_TRADEPROFIT_TOTAL').innerText = "Trade Profit Total:\n" + data.FLEETCARRIER.FLEETCARRIER_TRADEPROFIT_TOTAL.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('FLEETCARRIER_TRADESPEND_TOTAL').innerText = "Trade Spend Total:\n" + data.FLEETCARRIER.FLEETCARRIER_TRADESPEND_TOTAL.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('FLEETCARRIER_STOLENPROFIT_TOTAL').innerText = "Stolen Profit Total:\n" + data.FLEETCARRIER.FLEETCARRIER_STOLENPROFIT_TOTAL.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('FLEETCARRIER_STOLENSPEND_TOTAL').innerText = "Stolen Spend Total:\n" + data.FLEETCARRIER.FLEETCARRIER_STOLENSPEND_TOTAL.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('FLEETCARRIER_DISTANCE_TRAVELLED').innerText = "Distance Jumped:\n" + data.FLEETCARRIER.FLEETCARRIER_DISTANCE_TRAVELLED.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('FLEETCARRIER_TOTAL_JUMPS').innerText = "Total Jumps Made:\n" + data.FLEETCARRIER.FLEETCARRIER_TOTAL_JUMPS.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('FLEETCARRIER_SHIPYARD_SOLD').innerText = "Shipyard Sold:\n" + data.FLEETCARRIER.FLEETCARRIER_SHIPYARD_SOLD.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('FLEETCARRIER_SHIPYARD_PROFIT').innerText = "Shipyard Profit:\n" + data.FLEETCARRIER.FLEETCARRIER_SHIPYARD_PROFIT.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('FLEETCARRIER_OUTFITTING_SOLD').innerText = "Outfitting Sold:\n" + data.FLEETCARRIER.FLEETCARRIER_OUTFITTING_SOLD.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('FLEETCARRIER_OUTFITTING_PROFIT').innerText = "Outfitting Porfit:\n" + data.FLEETCARRIER.FLEETCARRIER_OUTFITTING_PROFIT.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('FLEETCARRIER_REARM_TOTAL').innerText = "Rearm Total:\n" + data.FLEETCARRIER.FLEETCARRIER_REARM_TOTAL.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('FLEETCARRIER_REFUEL_TOTAL').innerText = "Refuel Total:\n" + data.FLEETCARRIER.FLEETCARRIER_REFUEL_TOTAL.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('FLEETCARRIER_REFUEL_PROFIT').innerText = "Refuel Profit:\n" + data.FLEETCARRIER.FLEETCARRIER_REFUEL_PROFIT.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('FLEETCARRIER_REPAIRS_TOTAL').innerText = "Repair Total:\n" + data.FLEETCARRIER.FLEETCARRIER_REPAIRS_TOTAL.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('FLEETCARRIER_VOUCHERS_REDEEMED').innerText = "Vouchers Redeemed:\n" + data.FLEETCARRIER.FLEETCARRIER_VOUCHERS_REDEEMED.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('FLEETCARRIER_VOUCHERS_PROFIT').innerText = "Vouchers Profit:\n" + data.FLEETCARRIER.FLEETCARRIER_VOUCHERS_PROFIT.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  //Exobiology
  document.getElementById('Organic_Genus_Encountered').innerText = "Organic Genus Encountered:\n" + data.Exobiology.Organic_Genus_Encountered.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Organic_Species_Encountered').innerText = "Organic Species Encountered:\n" + data.Exobiology.Organic_Species_Encountered.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Organic_Variant_Encountered').innerText = "Organic Variant Encountered:\n" + data.Exobiology.Organic_Variant_Encountered.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Organic_Data_Profits').innerText = "Organic Data Profits:\n" + data.Exobiology.Organic_Data_Profits.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Organic_Data').innerText = "Organic Data:\n" + data.Exobiology.Organic_Data.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('First_Logged_Profits').innerText = "First Logged_Profits:\n" + data.Exobiology.First_Logged_Profits.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('First_Logged').innerText = "First Logged:\n" + data.Exobiology.First_Logged.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Organic_Systems').innerText = "Organic Systems:\n" + data.Exobiology.Organic_Systems.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Organic_Planets').innerText = "Organic Planets:\n" + data.Exobiology.Organic_Planets.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Organic_Genus').innerText = "Organic Genus:\n" + data.Exobiology.Organic_Genus.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  document.getElementById('Organic_Species').innerText = "Organic Species:\n" + data.Exobiology.Organic_Species.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}