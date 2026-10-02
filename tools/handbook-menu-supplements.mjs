// Manually transcribed from the user's PDF; never infer prices or allergy guarantees.
export const HANDBOOK_SOURCE = {
  id: 'handbook-0831', file: 'DisneyAdventure手冊公版_0831.pdf', reviewedAt: '2026-10-02',
  sha256: '055fa72056c7a47cb8f17ae08fad63c7851b23c1cb90b10e1652c612f5afc8db',
  note: '使用者提供的手冊，封面為 2026/9/24–9/28 航次；菜單不保證本航次供應。中文為查詢用翻譯。'
};
const rows = text => text.trim().split('\n').map(line => line.split('|').map(s => s.trim()));
const normal = text => String(text || '').normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
const unique = values => [...new Set(values.filter(Boolean))];
const groups = { rotational: '主餐廳', quick: '快餐', room: '客房送餐', concierge: '禮賓餐飲' };
const courseLabels = { appetizer: '前菜', entree: '主餐', drinks: '飲料', dessert: '甜點', 'kids-side': '兒童/配菜' };
const sections = [];
const add = (restaurantId, restaurantLabel, restaurantEnglish, group, period, page, text) => {
  sections.push({ restaurantId, restaurantLabel, restaurantEnglish, group, period, page, rows: rows(text) });
};

add('animator', '動畫師調色盤／動畫師餐桌', 'Animator’s Palate / Animator’s Table', 'rotational', '晚餐', 12,
  'Truffle Cremini Mushroom Risotto|松露褐蘑菇燉飯|entree|烤榛果與芝麻葉檸檬油。');
for (const [id, zh, en, page] of [
  ['nav', '航海家俱樂部／好萊塢聚光燈俱樂部', 'Navigator’s Club / Hollywood Spotlight Club', 11],
  ['animator', '動畫師調色盤／動畫師餐桌', 'Animator’s Palate / Animator’s Table', 12],
  ['pixar', '魔法盛夏餐廳／皮克斯市集餐廳', 'Enchanted Summer Restaurant / Pixar Market Restaurant', 13]
]) add(id, zh, en, 'rotational', '晚餐', page, 'Selection of Assorted Ice Cream|綜合冰淇淋選擇|dessert|口味依當餐供應。');

const embarkLunch = `Dill-marinated Shrimp|蒔蘿醃蝦|appetizer
Beef Teriyaki Bao|照燒牛肉包|appetizer
Mixed Salad|綜合沙拉|appetizer
Tom Kha Soup|冬蔭椰香雞湯|appetizer
Cream of Tomato Soup|番茄濃湯|appetizer|奶油布里歐麵包丁。
Pennette Pasta|斜管麵|entree
Chicken Caesar Salad|雞肉凱薩沙拉|entree
Plant-based Soba Noodle Bowl|植物性蕎麥麵碗|entree
Brinjal Bhaji Aubergine Curry|茄子咖哩|entree
Grilled Salmon Salad|炙烤鮭魚沙拉|entree
Carved Roast Beef Sirloin|烤沙朗牛肉|entree
Mango Cheesecake|芒果起司蛋糕|dessert
Carrot Cake|紅蘿蔔蛋糕|dessert
Welcome Aboard Sundae|迎賓聖代|dessert
Coconut Ice Cream|椰子冰淇淋|dessert
Coffee Crème Dome|咖啡奶霜圓頂|dessert|文件列於無加糖甜點；仍須確認個別飲食需求。
Macaroni & Cheese|起司通心粉|kids-side
Golden Chicken Strips with Barbecue Sauce|黃金雞柳佐燒烤醬|kids-side
Mini Burger|迷你漢堡|kids-side
Apple-Cinnamon Pie|蘋果肉桂派|dessert
Grilled Chicken Breast with Roasted Red Skin Potatoes and Steamed Carrots|烤雞胸肉佐烤馬鈴薯與蒸紅蘿蔔|kids-side|文件列於 Disney Check 兒童餐；甜點為新鮮西瓜。`;
add('nav', '航海家俱樂部／好萊塢聚光燈俱樂部', 'Navigator’s Club / Hollywood Spotlight Club', 'rotational', '登船午餐（開放餐廳依通知）', 9, embarkLunch);
add('main-breakfast', '主餐廳早餐（當日開放餐廳）', 'Main Restaurant Breakfast', 'rotational', '早餐', 10, `
Chilled Grapefruit|冰鎮葡萄柚|appetizer
Freshly Cut Fruit Bowl|新鮮水果拼盤|appetizer
Sliced Smoked Salmon|煙燻鮭魚拼盤|appetizer
Nature's Muesli|天然什錦穀片|entree
Choice of Assorted Fruit Yogurts or Lowfat Plain Yogurt|水果優格或低脂原味優格|entree
Oatmeal|燕麥粥|entree
Plain Congee|白粥|entree
Chicken Congee|雞肉粥|entree
Kimchi Fried Rice with Sunny Side Up Fried Egg|泡菜炒飯佐太陽蛋|entree
Chicken Fried Rice with Sunny Side Up Fried Egg|雞肉炒飯佐太陽蛋|entree
Danish Pastries|丹麥酥|dessert
Assorted Muffins|綜合瑪芬|dessert
Croissants|可頌|kids-side
Bagels|貝果|kids-side
Doughnuts|甜甜圈|dessert
English Muffins|英式瑪芬|kids-side
White Toast|白吐司|kids-side
Wheat Toast|全麥吐司|kids-side
Rye Toast|黑麥吐司|kids-side
Buttermilk Pancakes|美式鬆餅|entree|原味或巧克力口味；搭配楓糖漿與奶油。
Eggs for the Road|經典蛋料理拼盤|entree|可詢問炒蛋、煎蛋或水煮蛋，搭配薯餅；肉類選項為雞肉香腸、火腿或培根。
Omelets|歐姆蛋|entree|火腿起司、原味或切達起司，附薯餅。
Chicken Sausage Hash|雞肉香腸薯餅拼盤|entree|雞肉香腸、煎蛋、蔥、香菜、甜椒、傑克起司。
French Toast|法式吐司|entree|浸蛋液煎至金黃，搭配奶油與肉桂糖。
Masala Dosa|印度瑪薩拉薄餅|entree|搭配扁豆蔬菜湯、番茄醬、馬鈴薯咖哩與薄荷香菜醬。
Goofy's Get Up and Go|高飛活力早餐|kids-side|炒蛋、水果丁、烤雞肉香腸。
Captain Jack's Melon Boat|傑克船長水果船|kids-side|草莓優格搭配綜合水果。`);
add('stitch-grill', '史迪奇歐哈納燒烤', 'Stitch’s ’Ohana Grill', 'quick', '快餐', 14, `
THE 626|626 香辣炸雞堡|entree|酪乳醃香辣炸雞、萵苣、番茄、蒔蘿牧場醬、地瓜麵包。
Barbecue Huli-Huli Pulled Pork|呼里呼里燒烤手撕豬肉堡|entree|酥脆洋蔥圈、炙烤鳳梨、夏威夷甜麵包。
All Beef Hot Dog|全牛熱狗堡|entree|椒鹽長麵包、芥末美乃滋、韓式泡菜。
Bratwurst|德式香腸堡|entree|椒鹽長麵包、芥末美乃滋、韓式泡菜。
Gochujang Burger|韓式辣醬牛肉堡|entree|安格斯牛肉、烤波特菇、泡菜、紅薑、酥脆洋蔥。
The Classic|經典起司牛肉堡|entree|安格斯牛肉、切達起司、萵苣、番茄、酸黃瓜、芝麻麵包。
Impossible Burger|植物肉漢堡|entree|龍蒿蒜味美乃滋、紅蔥頭果醬、小麥麵包；飲食需求仍先詢問。
Black and Blue Burger|黑藍起司牛肉堡|entree|卡真風味牛肉、藍紋起司、細香蔥蒜味醬、酸紅洋蔥。`);
add('mowgli', '毛克利餐館', 'Mowgli’s Eatery', 'quick', '快餐', 15, `
Tandoori Chicken|坦都里烤雞|entree|印度烤雞，可搭配餐碗或拼盤。
Tandoori Lamb Hariyali|香草青醬坦都里羊肉|entree
Butter Chicken|奶油咖哩雞|entree
Kerala Fish Curry|喀拉拉魚咖哩|entree
Tandoori Vegetable Momos|坦都里蔬菜餃|entree
Variety of Richly Spiced Slow-cooked Vegetarian Dishes|香料慢燉蔬食料理|entree|具體菜色與素食需求請現場確認。
Crisp Naans|脆烤印度烤餅|kids-side
Soft Paratha|軟式印度煎餅|kids-side
Pulao|印度香料飯|kids-side
Fragrant Rice|香米飯|kids-side
Chutneys|印度酸辣醬|kids-side
Raitas|優格醬|kids-side`);
add('gramma-tala', '塔拉奶奶廚房', 'Gramma Tala’s Kitchen', 'quick', '快餐', 15, `
Hainanese Chicken|海南雞|entree
Huli-Huli BBQ Chicken|呼里呼里烤雞|entree
Black Pepper Beef|黑胡椒牛肉|entree
Sichuan Braised Tofu|四川風味燉豆腐|entree
Broccoli with Garlic|蒜香花椰菜|kids-side
Soy Glazed Yams|醬燒地瓜|kids-side
Fragrant Chicken Rice|香雞飯|kids-side
Malaysian Coconut Rice|馬來西亞椰香飯|kids-side
Buttermilk Fried Chicken|酪乳炸雞|entree
Chicken Tenders|雞柳條|entree
French Fries|薯條|kids-side
Chili-Garlic Paste / Ginger-Scallion Paste|辣椒蒜蓉醬／薑蔥醬|kids-side
Kimchi / Macaroni Salad / Pickled Radish|泡菜／通心粉沙拉／醃蘿蔔|kids-side
Red Ginger / Shredded Cabbage / Sliced Cucumber|紅薑／高麗菜絲／小黃瓜片|kids-side`);
add('wheezy-soft-serve', 'Wheezy’s Freezies 霜淇淋', 'Wheezy’s Freezies', 'quick', '霜淇淋（另有付費飲品）', 16, `
Complimentary Soft Serve|霜淇淋|dessert|文件列免費霜淇淋：香草、巧克力、草莓或雙口味。與付費特飲／冰沙不同，口味依現場。位置維持 Deck 17。`);
add('pizza-planet', '披薩星球', 'Pizza Planet', 'quick', '快餐', 16, `
Barbecue Chicken Pizza|燒烤雞肉披薩|entree|莫札瑞拉、紅洋蔥、烤甜椒、香菜。
Four Cheese Pizza|四種起司披薩|entree|番茄醬、戈貢佐拉、莫札瑞拉、帕瑪森、塔雷吉歐起司。
Pepperoni Pizza|義式臘腸披薩|entree|文件註明含豬肉；番茄醬、臘腸、莫札瑞拉、羅勒。
Margherita Pizza|瑪格麗特披薩|entree|番茄醬、新鮮番茄、莫札瑞拉、羅勒。
Plant-based Sausage Pizza|植物性香腸披薩|entree|菠菜、菇類、百里香、植物性起司；特殊飲食與交叉接觸風險請詢問。`);
add('cosmic-kebabs', '宇宙烤肉', 'Cosmic Kebabs', 'quick', '快餐', 17, `
Grilled Kebabs|烤肉串|entree
Shawarma|沙威瑪|entree
Vegetable Shish|蔬菜烤串|entree
Char-grilled Spiced Sausage|炭烤香料香腸|entree
Falafel|鷹嘴豆炸丸子|entree
Hummus|鷹嘴豆泥|kids-side
Pickled Red Cabbage|醃紫高麗菜|kids-side
Tabbouleh Salad|塔布勒沙拉|kids-side
Baba Ghanoush|巴巴甘納許茄泥|kids-side
Sumac Red Onion|蘇馬克香料紅洋蔥|kids-side
Soft Pita|軟皮塔餅|kids-side
Seasoned French Fries|調味薯條|kids-side`);
add('room-service', '客房送餐 Room Service', 'Room Service', 'room', '早餐掛牌', 18, `
Orange / Apple / Grapefruit Juice|柳橙／蘋果／葡萄柚汁|drinks
Fresh Fruit Bowl|新鮮水果碗|appetizer
Danish Pastries|丹麥酥|dessert
Assortment of Muffins|綜合瑪芬|dessert
Croissants|可頌|kids-side
Doughnuts|甜甜圈|dessert
White Toast / Whole Wheat Toast|白吐司／全麥吐司|kids-side
English Muffins / Bagel|英式瑪芬／貝果|kids-side
Cold Cereals|冷穀片|entree|Rice Krispies、Corn Flakes、Frosties、Froot Loops、Granola、Coco Crunch；依當次掛牌勾選。
Hot Chocolate|熱巧克力|drinks
Lowfat Milk / Whole Milk / Chocolate Milk|低脂／全脂／巧克力牛奶|drinks
Selection of Jams and Honey|果醬與蜂蜜|kids-side
Margarine / Butter / Cream Cheese|人造奶油／奶油／奶油乳酪|kids-side`);
add('room-service', '客房送餐 Room Service', 'Room Service', 'room', '主餐與甜點', 19, `
International Cheese Plate|精選國際起司盤|appetizer|附餅乾與 Mini Babybel 起司。
Chicken Wonton Noodle Soup|雞肉餛飩麵湯|entree|蘑菇、蔥、青江菜、黃瓜蘿蔔沙拉。
Rasam Indian Tomato Soup|印度香料番茄湯|appetizer|搭配印度香米。
Pennette Bolognaise|波隆那肉醬筆管麵|entree|肉醬、帕瑪森起司、蒜味烤麵包。
Grilled Angus American Cheeseburger|炙烤安格斯美式起司漢堡|entree|布里歐麵包、生菜、洋蔥、番茄、酸黃瓜、薯片。
Crisp Breaded Chicken Tenders|酥脆麵衣雞柳|entree|柚子美乃滋、黃瓜與醬油薑汁沙拉。
Dan-Dan Noodles|擔擔麵|entree|文件註明含豬肉；小麥麵、豬絞肉、四川花椒、芥菜、蔥。
Dal Makhani|奶油扁豆咖哩|entree|印度煎餅、小黃瓜優格醬。
Grilled Salmon Salad|炙烤鮭魚沙拉|entree|萵苣、生菜、番茄、洋蔥、黃瓜、蘋果蔓越莓穀物與蜂蜜芥末醬。
New York Cheesecake|紐約起司蛋糕|dessert|覆盆子甘納許、鮮奶油。
Chocolate Truffle Cake|巧克力松露蛋糕|dessert|巧克力布朗尼、松露慕斯、巧克力醬。`);
add('concierge-welcome', '禮賓歡迎午餐（地點依通知）', 'Concierge Welcome Lunch', 'concierge', '登船午餐', 20,
  embarkLunch.split('\n').filter(line => !/^(Grilled Salmon Salad|Carved Roast Beef Sirloin|Coconut Ice Cream)/.test(line)).join('\n') + `
Poached Lobster Tail Salad|水煮龍蝦尾沙拉|entree|菠菜、芝麻葉、馬鈴薯、蘆筍等，配檸檬與巴西里醬。
Roasted Beef Tenderloin|烤牛里肌|entree|炒菇、地瓜泥、紅酒醬與薯片。
Chocolate-Hazelnut Molten Cake|巧克力榛果熔岩蛋糕|dessert|巧克力醬、榛果冰淇淋、海鹽。`);
add('concierge-food', '禮賓酒廊餐點', 'Concierge Lounge', 'concierge', '早餐（文件 07:00–10:30）', 21, `
Raspberry-Chocolate Croissant|覆盆子巧克力可頌|entree|奶油乳酪。
Breakfast Sandwich|早餐三明治|entree|含豬肉：焦糖波本培根、番茄、煎蛋、煙燻高達起司、全穀麵包。
Siu Mai|雞肉燒賣|entree|佐飛魚卵。
Avocado Toast|酪梨吐司|entree|酪梨、草莓、山羊起司，文件列無麩質黑麥麵包；過敏需求請再確認。
Poached Cage-free Egg on Toasted English Muffin|英式瑪芬水波放養蛋|entree|可選迷迭香火腿與荷蘭醬（含豬肉），或煙燻鮭魚、荷蘭醬與魚子醬。
Fish Ball Noodle Soup|魚丸粿條湯|entree
Mickey Waffle|米奇造型鬆餅|kids-side|鮮奶油、草莓果醬、肉桂糖。
French Toast Roll-Ups|法式吐司捲|kids-side|覆盆子果醬與奶油霜。`);
add('concierge-food', '禮賓酒廊餐點', 'Concierge Lounge', 'concierge', '午後現點菜單（時段現場確認）', 22, `
Kimchi Chicken Tofu Soup|泡菜雞肉豆腐湯|entree|蔥、蘑菇、海苔飯糰。
Gambas Pil Pil|西班牙蒜香蝦|entree|蒜頭快炒，搭配辣椒與紅椒粉。
Tofu Banh Mi Vegan Slider|越式豆腐迷你堡|entree|蘿蔔與紅蘿蔔絲、千島醬、芝麻麵包；素食需求請詢問。
Buffalo Chicken Pita Bread Panini|水牛城雞肉皮塔帕尼尼|entree|焦糖紅洋蔥、藍起司、水牛城辣醬。
All American Sliders|經典美式迷你漢堡|entree|安格斯牛肉、生菜、番茄、紅洋蔥、酸黃瓜、煙燻切達起司。
Chicken Fried Rice|雞肉炒飯|kids-side|搭配旋風蛋與番茄醬。`);
add('concierge-food', '禮賓酒廊餐點', 'Concierge Lounge', 'concierge', '晚間（文件 17:00–20:00）', 23, `
Tagliatelle Aragosta|龍蝦寬帶麵|entree|龍蝦、櫻桃番茄。
Alder-smoked Seared Scallops|赤楊木煙燻香煎干貝|entree|奶油南瓜泥、茴香蘋果沙拉、南瓜籽。
Paneer Butter Masala|印度起司奶油瑪薩拉|entree|搭配印度薄餅。
Buttermilk-fried Chicken|酪乳炸雞|entree|萵苣、甜椒起司抹醬、牧場醬、洋蔥麵包。
Hainanese Chicken Cutlet Rice Bowl|海南雞排飯|kids-side|炒蛋、酸甜醬汁。`);
add('concierge-food', '禮賓酒廊餐點', 'Concierge Lounge', 'concierge', '全日菜單（文件 11:00–20:00）', 24, `
Seared Ahi Tuna Niçoise Salad|香煎黃鰭鮪魚尼斯沙拉|entree|四季豆、馬鈴薯、橄欖、鵪鶉蛋、生菜與第戎芥末油醋醬。
Heirloom Tomato Soup|傳家寶番茄湯|appetizer|布里歐麵包丁。
Szechuan Noodles|四川風味麵|entree|含豬肉；花生醬油汁、小白菜、芥菜、四川辣油、香烤豬肉。
All American Cheeseburger|經典美式起司漢堡|entree|安格斯牛肉、煙燻切達、生菜、番茄、紅洋蔥、酸黃瓜、麵包，附薯條。
Paneer Butter Masala|印度起司奶油瑪薩拉|entree|搭配印度薄餅；此為全日菜單版本，與晚間版本分開保留。
Crudités|綜合鮮蔬拼盤|appetizer|紅蘿蔔、芹菜、小黃瓜、櫻桃番茄、牧場沙拉醬。
New York Cheesecake|紐約起司蛋糕|dessert|覆盆子甘納許、鮮奶油。
Chocolate-Salted Caramel Tart|巧克力海鹽焦糖塔|dessert|黑巧克力甘納許、焦糖脆片。
Golden Chicken Strips|黃金雞柳條|kids-side|薯條、燒烤醬。`);
add('concierge-sundeck-food', '禮賓日光甲板餐點', 'Concierge Sundeck', 'concierge', '日光甲板菜單（供應依當日通知）', 25, `
Tandoori Chicken Wings|坦都里烤雞翅|entree|瑪薩拉薯條、柑橘蒜味美乃滋。
Paneer Tikka Kebab|印度香料烤起司串|entree|香菜墨西哥辣椒沾醬。
All American Classic Burger|美式經典漢堡|entree|安格斯牛肉、生菜、番茄、紅洋蔥、酸黃瓜、煙燻切達。
Half Pint of Prawns|半品脫鮮蝦|entree|檸檬、蒜味美乃滋、瑪麗玫瑰醬。
Sun Deck Salad|日光甲板沙拉|entree|生菜、紅蘿蔔、蘿蔔、小黃瓜、番茄與紅蔥頭第戎芥末醬。
Kachumber Salad / Red Onion Salad / Cucumber Raita / Mango Chutney|卡春伯沙拉／紅洋蔥沙拉／黃瓜優格醬／芒果酸辣醬|kids-side
Plain Naan / Garlic Naan / Truffle Fries|原味烤餅／蒜香烤餅／松露薯條|kids-side`);

// English keys match the preserved snapshot, not PDF typographical errors.
const dinnerNames = rows(`
Mini Herb Brioche · Soft White · Whole Wheat Rolls|香草布里歐、白麵包與全麥餐包
Sautéed Maitake Mushrooms|清炒舞菇
Fennel, Bartlett Pear, Tatsoi Salad|茴香西洋梨塔菜沙拉
Porcini-spiced Ahi Tuna Sashimi|牛肝菌香料黃鰭鮪魚生魚片
Duck Confit Pastilla|法式油封鴨肉派
Thai Shrimp Pumpkin Soup|泰式鮮蝦南瓜湯
Roasted Roma Tomato Soup|爐烤羅馬番茄湯
Thai Boat Noodles|泰式船麵
Roasted Butternut Squash Risotto|烤奶油南瓜燉飯
Chicken Tikka Masala|香料烤雞咖哩
Miso-glazed Chilean Sea Bass|味噌智利海鱸魚
Moroccan-spiced Roasted Kabocha|摩洛哥香料烤南瓜
Peppered Filet Mignon|黑胡椒菲力牛排
Pav Bhaji Slow-cooked Vegetable Curry|慢燉印度蔬菜泥咖哩
Lobster Salad|龍蝦沙拉
Hainanese Chicken, Rice|海南雞飯
Banana Leaf Steamed Filet of Salmon|芭蕉葉蒸鮭魚
Chocolate Molten Cake|熔岩巧克力蛋糕
Ube Creme Brulee|紫薯烤布蕾
Blueberry-Lemon Bavarian Cream|藍莓檸檬巴伐利亞奶凍
Coconut-Tapioca Pudding|椰香西米露布丁
Strawberry Shortcake Sundae|草莓脆餅聖代
Roasted Creamy Tomato Soup|烤番茄濃湯
Sweet Corn and Edamame Salad|甜玉米毛豆沙拉
Chicken Pot Pie|雞肉派
Panko Crusted Cod|日式麵包粉酥炸鱈魚
Barbecue Chicken Pizza|燒烤雞肉披薩
Mini Cheeseburger|迷你起司漢堡
Roasted Turkey Breast|烤火雞胸肉
Whole Wheat Spiral Pasta|全麥螺旋義大利麵
Showtime Cupcake|杯子蛋糕
Matcha Marble · Soft White · Whole Wheat Rolls|抹茶大理石、白麵包與全麥餐包
Green Papaya Salad|青木瓜沙拉
Summer Roll|夏日鮮蝦生春捲
Porcini Sacchetti|牛肝菌起司福袋麵
Sliced Bresaola|義式風乾牛肉薄片
Baby Gem Salad|寶石生菜沙拉
Hot Sour Soup|酸辣湯
French Onion Soup|法式洋蔥湯
Chicken Shahi Korma|奶油雞肉咖哩
Gemelli Bolognese|肉醬雙子麵
Sesame Halloumi Filo Parcels|芝麻哈魯米起司酥皮派
Seared Verlasso Salmon Fillet|香煎 Verlasso 鮭魚排
Roasted Prime Rib of Beef|爐烤頂級牛肋排
Baingan Bharta|印度香料烤茄泥
Mango-Chicken Salad|芒果雞肉沙拉
Hainanese Chicken Rice|海南雞飯
Banana Leaf Steamed Fillet of Salmon|芭蕉葉蒸鮭魚
Grilled Grain-fed Sirloin Steak|炭烤穀飼沙朗牛排
White Chocolate Bread Pudding|白巧克力麵包布丁
Orange Almond Cake|香橙杏仁蛋糕
Lemon Thai Basil Tart|檸檬泰式羅勒塔
Coconut Rice Pudding|椰香米布丁
Chocolate Fudge Sundae|巧克力聖代
Sweet Carrot Soup|甜胡蘿蔔濃湯
Garden Salad|田園沙拉
Surf and Turf|海陸主餐
Chicken Potstickers|雞肉煎餃
Turkey Bolognese|火雞肉醬義大利麵
Whole Wheat Penne Pasta|全麥筆管麵
Strawberry Cheesecake|草莓起司蛋糕
Spring Onion Cheese · Soft White · Whole Wheat Rolls|蔥起司、白麵包與全麥餐包
Korean Barbecue Beef Steamed Bao|韓式烤牛肉刈包
Rice Noodle Salad|米線沙拉
Dragon Roll|龍捲壽司
Chicken Satay|沙嗲雞肉串
Hearts of Palm|棕櫚心沙拉
Romaine Heart Caesar Salad|蘿蔓凱薩沙拉
Wonton Soup|雞肉雲吞湯
Molokai Corn and Taro Chowder|摩洛凱玉米芋頭濃湯
Laksa Lemak|椰奶叻沙
Murgh Makhani Butter Chicken|瑪卡尼奶油咖哩雞
Pan-seared Pacific Scallops|香煎太平洋干貝
Tofu Poke|豆腐波奇碗
Pan-seared Branzino Fillet|香煎歐洲海鱸魚排
Carved Slow-roasted Rosemary Beef Tenderloin|慢烤迷迭香牛菲力
Chettinad Vegetable Korma|雀提納蔬菜咖哩
Honey Soy-roasted Duck and Papaya Salad|蜜汁醬烤鴨木瓜沙拉
Almond-Pear Tart|杏仁洋梨塔
Salted Caramel Cheesecake|海鹽焦糖起司蛋糕
Chocolate Decadence|濃郁巧克力甜點
Cappuccino Mousse|卡布奇諾慕斯
Cookies 'n Cream Sundae|巧酥冰淇淋聖代
Creamed Potato Soup|奶油馬鈴薯濃湯
Chicken Katsu|日式炸雞排
Crisp Vegetable Spring Rolls|酥脆蔬菜春捲
Hawaiian Barbecue Chicken Pizza|夏威夷燒烤雞肉披薩
Grilled Chicken|烤雞
Whole Wheat Spaghetti Pasta|全麥義大利直麵
Chocolate Dome|巧克力圓頂蛋糕`);

export function applyHandbookMenus(payload) {
  const result = structuredClone(payload);
  const labels = new Map(dinnerNames.map(([en, zh]) => [normal(en), zh]));
  const restaurantNames = {
    nav: ['航海家俱樂部／好萊塢聚光燈俱樂部', 'Navigator’s Club / Hollywood Spotlight Club', 11],
    pixar: ['魔法盛夏餐廳／皮克斯市集餐廳', 'Enchanted Summer Restaurant / Pixar Market Restaurant', 13],
    animator: ['動畫師調色盤／動畫師餐桌', 'Animator’s Palate / Animator’s Table', 12]
  };
  for (const record of result.records.filter(r => !r.supplementSourceId)) {
    const meta = restaurantNames[record.restaurantId];
    if (!meta) continue;
    const zh = labels.get(normal(record.englishName));
    record.aliases = unique([...(record.aliases || []), record.zhLabel, record.restaurantLabel, record.restaurantEnglish, zh, meta[0], meta[1]]);
    if (zh) record.zhLabel = zh;
    [record.restaurantLabel, record.restaurantEnglish] = meta;
    record.sourceRefs = unique([...(record.sourceRefs || []), `${HANDBOOK_SOURCE.file} p.${meta[2]}（中譯／配對餐廳核對；原描述與價格保留）`]);
  }
  // Rebuild only this document's supplements; reruns never multiply rows.
  result.records = result.records.filter(r => r.supplementSourceId !== HANDBOOK_SOURCE.id);
  const keys = new Set(result.records.map(r => [r.restaurantId, r.mealPeriod || '', normal(r.englishName)].join('|')));
  for (const section of sections) {
    for (const [englishName, zhLabel, courseGroup, description = ''] of section.rows) {
      const key = [section.restaurantId, section.period, normal(englishName)].join('|');
      if (keys.has(key)) continue;
      keys.add(key);
      const slug = normal(englishName).replace(/[^a-z0-9]+/g, '-');
      result.records.push({
        id: `menu-handbook-${section.restaurantId}-p${section.page}-${slug}`, sourceType: 'menu-item',
        zhLabel, englishName, descriptionZh: description,
        restaurantId: section.restaurantId, restaurantLabel: section.restaurantLabel, restaurantEnglish: section.restaurantEnglish,
        restaurantGroup: section.group, restaurantGroupLabel: groups[section.group],
        restaurantOrder: result.restaurants.find(r => r.id === section.restaurantId)?.order ?? 100 + sections.findIndex(s => s.restaurantId === section.restaurantId),
        menuCategory: courseGroup === 'kids-side' ? 'sides' : ({ appetizer: 'appetizers', entree: 'entrees', dessert: 'desserts', drinks: 'drinks' })[courseGroup],
        menuCategoryLabel: courseLabels[courseGroup], courseGroup, courseGroupLabel: courseLabels[courseGroup],
        mealPeriod: section.period, price: '', tags: [], tagLabels: [],
        aliases: unique([section.restaurantLabel, section.restaurantEnglish, section.period, '附件菜單',
          section.group === 'concierge' && courseGroup === 'entree' ? '禮賓熱食' : '',
          section.restaurantId === 'room-service' && section.period.includes('早餐') ? '客房早餐' : '']),
        crewPhrase: courseGroup === 'drinks' ? 'Could I order this drink, please?' : 'Could I order this, please?',
        sourceRecordIndex: result.records.length, supplementSourceId: HANDBOOK_SOURCE.id,
        sourceRefs: [`${HANDBOOK_SOURCE.file} p.${section.page}（歷史菜單；供應、費用與過敏需求現場確認）`]
      });
    }
  }
  for (const record of result.records) record.searchText = normal([
    record.zhLabel, record.englishName, record.descriptionZh, record.restaurantLabel, record.restaurantEnglish,
    record.restaurantGroupLabel, record.courseGroupLabel, record.mealPeriod, ...(record.aliases || []), ...(record.tagLabels || [])
  ].filter(Boolean).join(' '));
  const restaurantIds = unique(result.records.map(r => r.restaurantId));
  result.restaurants = restaurantIds.map(id => {
    const record = result.records.find(r => r.restaurantId === id);
    return { id, label: record.restaurantLabel, englishName: record.restaurantEnglish, group: record.restaurantGroup,
      groupLabel: record.restaurantGroupLabel, order: record.restaurantOrder, count: result.records.filter(r => r.restaurantId === id).length };
  }).sort((a, b) => a.order - b.order);
  for (const [id, label] of Object.entries(groups)) if (!result.restaurantGroups.some(g => g.id === id)) result.restaurantGroups.push({ id, label });
  result.documentSupplements = [HANDBOOK_SOURCE];
  result.supplementCount = result.records.filter(r => r.supplementSourceId).length;
  result.recordsCount = result.records.length;
  result.version = '2026-10-02-handbook-v1';
  return result;
}
