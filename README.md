# Cyber Sleuth Query

Perform SQL style SELECT statements on a json list of digimon from Digimon Story: Cyber Sleuth

Use basic statements through the webpage form to search for single attributes. Select the value you would like to query from the Query dropdown menu and enter a value in the corresponding input below.

Manually enter a query by selecting manual from the Query dropdown and type in query in Manual Query textbox.
Basic syntax is:

>select $value1,$value2 from digimon where ($condition) order by $value $order
  
Where:

  **$value1,$value2** is a list of the values you want returned<br>
  **$condition** is a raw javascript conditional to apply to the dataset. && and || can be used to perform logical AND and OR operations<br>
  **$value** is the value to sort the results by<br>
  **$order** should be either asc or desc<br>
  
  There should be no spaces between $value1,$value2,...<br>
  "order by $value $order" is optional
  
Sample queries:

Get names of all 'Vaccine' digimon
>select name from digimon where (type=='Vaccine')

Get names of digimon that digivolve into Omnimon
>select name from digimon where (digivolvesTo(current, "Omnimon"))

Get names of digimon that are Vaccine, Fire and have level 99 hp over 2000
>select name from digimon where (type=='Vaccine' && attribute=='Fire' && lv99Stats.hp > 2000)
