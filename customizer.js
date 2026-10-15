// ========================================
// KQ EVENT STYLING
// EVENT STYLING CUSTOMIZER
// SUPABASE VERSION
// ========================================

// City-centre coordinates: Open Admin Data / GeoNames, CC BY 4.0. Estimate only.
const PH_CITY_COORDINATES = [{"name":"Adams","province":"Ilocos Norte","region":"Ilocos Region","lat":18.467,"lng":120.9},{"name":"Bacarra","province":"Ilocos Norte","region":"Ilocos Region","lat":18.25,"lng":120.617},{"name":"Badoc","province":"Ilocos Norte","region":"Ilocos Region","lat":17.933,"lng":120.467},{"name":"Bangui","province":"Ilocos Norte","region":"Ilocos Region","lat":18.533,"lng":120.767},{"name":"Batac","province":"Ilocos Norte","region":"Ilocos Region","lat":18.05,"lng":120.567},{"name":"Burgos","province":"Ilocos Norte","region":"Ilocos Region","lat":18.51611,"lng":120.64611},{"name":"Carasi","province":"Ilocos Norte","region":"Ilocos Region","lat":18.2,"lng":120.867},{"name":"Currimao","province":"Ilocos Norte","region":"Ilocos Region","lat":18.017,"lng":120.483},{"name":"Dingras","province":"Ilocos Norte","region":"Ilocos Region","lat":18.117,"lng":120.7},{"name":"Dumalneg","province":"Ilocos Norte","region":"Ilocos Region","lat":18.5,"lng":120.817},{"name":"Banna (Espiritu)","province":"Ilocos Norte","region":"Ilocos Region","lat":17.983,"lng":120.65},{"name":"Laoag City","province":"Ilocos Norte","region":"Ilocos Region","lat":18.183,"lng":120.583},{"name":"Marcos","province":"Ilocos Norte","region":"Ilocos Region","lat":18.05,"lng":120.683},{"name":"Nueva Era","province":"Ilocos Norte","region":"Ilocos Region","lat":17.917,"lng":120.667},{"name":"Pagudpud","province":"Ilocos Norte","region":"Ilocos Region","lat":18.567,"lng":120.8},{"name":"Paoay","province":"Ilocos Norte","region":"Ilocos Region","lat":18.05,"lng":120.517},{"name":"Pasuquin","province":"Ilocos Norte","region":"Ilocos Region","lat":18.333,"lng":120.617},{"name":"Piddig","province":"Ilocos Norte","region":"Ilocos Region","lat":18.167,"lng":120.733},{"name":"Pinili","province":"Ilocos Norte","region":"Ilocos Region","lat":17.95389,"lng":120.52694},{"name":"San Nicolas","province":"Ilocos Norte","region":"Ilocos Region","lat":18.1725,"lng":120.59583},{"name":"Sarrat","province":"Ilocos Norte","region":"Ilocos Region","lat":18.167,"lng":120.65},{"name":"Solsona","province":"Ilocos Norte","region":"Ilocos Region","lat":18.1,"lng":120.767},{"name":"Vintar","province":"Ilocos Norte","region":"Ilocos Region","lat":18.23,"lng":120.64194},{"name":"Alilem","province":"Ilocos Sur","region":"Ilocos Region","lat":16.883,"lng":120.533},{"name":"Banayoyo","province":"Ilocos Sur","region":"Ilocos Region","lat":17.233,"lng":120.483},{"name":"Bantay","province":"Ilocos Sur","region":"Ilocos Region","lat":17.583,"lng":120.383},{"name":"Burgos","province":"Ilocos Sur","region":"Ilocos Region","lat":17.333,"lng":120.5},{"name":"Cabugao","province":"Ilocos Sur","region":"Ilocos Region","lat":17.8,"lng":120.45},{"name":"Candon","province":"Ilocos Sur","region":"Ilocos Region","lat":17.2,"lng":120.45},{"name":"Caoayan","province":"Ilocos Sur","region":"Ilocos Region","lat":17.533,"lng":120.4},{"name":"Cervantes","province":"Ilocos Sur","region":"Ilocos Region","lat":16.99167,"lng":120.73333},{"name":"Galimuyod","province":"Ilocos Sur","region":"Ilocos Region","lat":17.183,"lng":120.467},{"name":"Gregorio Del Pilar (Concepcion)","province":"Ilocos Sur","region":"Ilocos Region","lat":6.4541,"lng":124.8801},{"name":"Lidlidda","province":"Ilocos Sur","region":"Ilocos Region","lat":17.267,"lng":120.517},{"name":"Magsingal","province":"Ilocos Sur","region":"Ilocos Region","lat":17.68333,"lng":120.425},{"name":"Nagbukel","province":"Ilocos Sur","region":"Ilocos Region","lat":17.45,"lng":120.55},{"name":"Narvacan","province":"Ilocos Sur","region":"Ilocos Region","lat":17.417,"lng":120.483},{"name":"Quirino (Angkaki)","province":"Ilocos Sur","region":"Ilocos Region","lat":17.15,"lng":120.667},{"name":"Salcedo (Baugen)","province":"Ilocos Sur","region":"Ilocos Region","lat":17.15,"lng":120.533},{"name":"San Emilio","province":"Ilocos Sur","region":"Ilocos Region","lat":17.233,"lng":120.617},{"name":"San Esteban","province":"Ilocos Sur","region":"Ilocos Region","lat":17.333,"lng":120.45},{"name":"San Ildefonso","province":"Ilocos Sur","region":"Ilocos Region","lat":17.617,"lng":120.4},{"name":"San Juan (Lapog)","province":"Ilocos Sur","region":"Ilocos Region","lat":17.72917,"lng":120.46083},{"name":"San Vicente","province":"Ilocos Sur","region":"Ilocos Region","lat":17.58111,"lng":120.34694},{"name":"Santa","province":"Ilocos Sur","region":"Ilocos Region","lat":17.49056,"lng":120.43722},{"name":"Santa Catalina","province":"Ilocos Sur","region":"Ilocos Region","lat":17.6,"lng":120.367},{"name":"Santa Cruz","province":"Ilocos Sur","region":"Ilocos Region","lat":17.02,"lng":120.47472},{"name":"Santa Lucia","province":"Ilocos Sur","region":"Ilocos Region","lat":17.117,"lng":120.45},{"name":"Santa Maria","province":"Ilocos Sur","region":"Ilocos Region","lat":17.35861,"lng":120.49806},{"name":"Santiago","province":"Ilocos Sur","region":"Ilocos Region","lat":17.3,"lng":120.45},{"name":"Santo Domingo","province":"Ilocos Sur","region":"Ilocos Region","lat":17.633,"lng":120.417},{"name":"Sigay","province":"Ilocos Sur","region":"Ilocos Region","lat":17.033,"lng":120.583},{"name":"Sinait","province":"Ilocos Sur","region":"Ilocos Region","lat":17.86611,"lng":120.45806},{"name":"Sugpon","province":"Ilocos Sur","region":"Ilocos Region","lat":16.85,"lng":120.517},{"name":"Suyo","province":"Ilocos Sur","region":"Ilocos Region","lat":16.98,"lng":120.52694},{"name":"Tagudin","province":"Ilocos Sur","region":"Ilocos Region","lat":16.933,"lng":120.45},{"name":"Vigan","province":"Ilocos Sur","region":"Ilocos Region","lat":17.57,"lng":120.38},{"name":"Agoo","province":"La Union","region":"Ilocos Region","lat":16.325,"lng":120.36861},{"name":"Aringay","province":"La Union","region":"Ilocos Region","lat":16.383,"lng":120.417},{"name":"Bacnotan","province":"La Union","region":"Ilocos Region","lat":16.717,"lng":120.35},{"name":"Bagulin","province":"La Union","region":"Ilocos Region","lat":16.60833,"lng":120.43944},{"name":"Balaoan","province":"La Union","region":"Ilocos Region","lat":16.817,"lng":120.4},{"name":"Bangar","province":"La Union","region":"Ilocos Region","lat":16.89806,"lng":120.42306},{"name":"Bauang","province":"La Union","region":"Ilocos Region","lat":16.53083,"lng":120.33306},{"name":"Burgos","province":"La Union","region":"Ilocos Region","lat":16.517,"lng":120.467},{"name":"Caba","province":"La Union","region":"Ilocos Region","lat":16.433,"lng":120.35},{"name":"Luna","province":"La Union","region":"Ilocos Region","lat":16.85389,"lng":120.38111},{"name":"Naguilian","province":"La Union","region":"Ilocos Region","lat":16.533,"lng":120.4},{"name":"Pugo","province":"La Union","region":"Ilocos Region","lat":16.283,"lng":120.483},{"name":"Rosario","province":"La Union","region":"Ilocos Region","lat":16.23194,"lng":120.48806},{"name":"San Fernando","province":"La Union","region":"Ilocos Region","lat":16.7847,"lng":121.7181},{"name":"San Gabriel","province":"La Union","region":"Ilocos Region","lat":16.675,"lng":120.4},{"name":"San Juan","province":"La Union","region":"Ilocos Region","lat":16.66889,"lng":120.34111},{"name":"Santo Tomas","province":"La Union","region":"Ilocos Region","lat":16.26361,"lng":120.39389},{"name":"Santol","province":"La Union","region":"Ilocos Region","lat":16.767,"lng":120.45},{"name":"Sudipen","province":"La Union","region":"Ilocos Region","lat":16.9,"lng":120.45},{"name":"Tubao","province":"La Union","region":"Ilocos Region","lat":16.35,"lng":120.417},{"name":"Agno","province":"Pangasinan","region":"Ilocos Region","lat":16.117,"lng":119.8},{"name":"Aguilar","province":"Pangasinan","region":"Ilocos Region","lat":15.833,"lng":120.2},{"name":"Alaminos","province":"Pangasinan","region":"Ilocos Region","lat":14.06306,"lng":121.24806},{"name":"Alcala","province":"Pangasinan","region":"Ilocos Region","lat":15.84722,"lng":120.52417},{"name":"Anda","province":"Pangasinan","region":"Ilocos Region","lat":16.283,"lng":119.967},{"name":"Asingan","province":"Pangasinan","region":"Ilocos Region","lat":16.0,"lng":120.667},{"name":"Balungao","province":"Pangasinan","region":"Ilocos Region","lat":15.9,"lng":120.7},{"name":"Bani","province":"Pangasinan","region":"Ilocos Region","lat":16.2,"lng":119.85},{"name":"Basista","province":"Pangasinan","region":"Ilocos Region","lat":15.85,"lng":120.4},{"name":"Bautista","province":"Pangasinan","region":"Ilocos Region","lat":15.783,"lng":120.5},{"name":"Bayambang","province":"Pangasinan","region":"Ilocos Region","lat":15.81056,"lng":120.45472},{"name":"Binalonan","province":"Pangasinan","region":"Ilocos Region","lat":16.05,"lng":120.6},{"name":"Binmaley","province":"Pangasinan","region":"Ilocos Region","lat":16.033,"lng":120.267},{"name":"Bolinao","province":"Pangasinan","region":"Ilocos Region","lat":16.333,"lng":119.883},{"name":"Bugallon","province":"Pangasinan","region":"Ilocos Region","lat":15.917,"lng":120.183},{"name":"Burgos","province":"Pangasinan","region":"Ilocos Region","lat":16.04639,"lng":119.85667},{"name":"Calasiao","province":"Pangasinan","region":"Ilocos Region","lat":16.017,"lng":120.367},{"name":"Dagupan City","province":"Pangasinan","region":"Ilocos Region","lat":16.03,"lng":120.33},{"name":"Dasol","province":"Pangasinan","region":"Ilocos Region","lat":15.98972,"lng":119.88056},{"name":"Infanta","province":"Pangasinan","region":"Ilocos Region","lat":15.817,"lng":119.9},{"name":"Labrador","province":"Pangasinan","region":"Ilocos Region","lat":16.0,"lng":120.117},{"name":"Lingayen","province":"Pangasinan","region":"Ilocos Region","lat":16.02,"lng":120.23083},{"name":"Mabini","province":"Pangasinan","region":"Ilocos Region","lat":16.06972,"lng":119.94},{"name":"Malasiqui","province":"Pangasinan","region":"Ilocos Region","lat":15.917,"lng":120.417},{"name":"Manaoag","province":"Pangasinan","region":"Ilocos Region","lat":16.04389,"lng":120.48556},{"name":"Mangaldan","province":"Pangasinan","region":"Ilocos Region","lat":16.067,"lng":120.4},{"name":"Mangatarem","province":"Pangasinan","region":"Ilocos Region","lat":15.783,"lng":120.3},{"name":"Mapandan","province":"Pangasinan","region":"Ilocos Region","lat":16.017,"lng":120.45},{"name":"Natividad","province":"Pangasinan","region":"Ilocos Region","lat":16.05,"lng":120.817},{"name":"Pozorrubio","province":"Pangasinan","region":"Ilocos Region","lat":16.1089,"lng":120.5456},{"name":"Rosales","province":"Pangasinan","region":"Ilocos Region","lat":15.883,"lng":120.633},{"name":"San Carlos City","province":"Pangasinan","region":"Ilocos Region","lat":15.92806,"lng":120.34889},{"name":"San Fabian","province":"Pangasinan","region":"Ilocos Region","lat":16.15,"lng":120.45},{"name":"San Jacinto","province":"Pangasinan","region":"Ilocos Region","lat":16.0725,"lng":120.44111},{"name":"San Manuel","province":"Pangasinan","region":"Ilocos Region","lat":16.067,"lng":120.667},{"name":"San Nicolas","province":"Pangasinan","region":"Ilocos Region","lat":16.07,"lng":120.76528},{"name":"San Quintin","province":"Pangasinan","region":"Ilocos Region","lat":15.98444,"lng":120.815},{"name":"Santa Barbara","province":"Pangasinan","region":"Ilocos Region","lat":16.00306,"lng":120.40083},{"name":"Santa Maria","province":"Pangasinan","region":"Ilocos Region","lat":15.98083,"lng":120.70028},{"name":"Santo Tomas","province":"Pangasinan","region":"Ilocos Region","lat":15.71194,"lng":120.58472},{"name":"Sison","province":"Pangasinan","region":"Ilocos Region","lat":16.15694,"lng":120.52222},{"name":"Sual","province":"Pangasinan","region":"Ilocos Region","lat":16.067,"lng":120.1},{"name":"Tayug","province":"Pangasinan","region":"Ilocos Region","lat":16.02361,"lng":120.74778},{"name":"Umingan","province":"Pangasinan","region":"Ilocos Region","lat":15.9,"lng":120.8},{"name":"Urbiztondo","province":"Pangasinan","region":"Ilocos Region","lat":15.817,"lng":120.35},{"name":"Urdaneta","province":"Pangasinan","region":"Ilocos Region","lat":15.97611,"lng":120.57111},{"name":"Villasis","province":"Pangasinan","region":"Ilocos Region","lat":15.9,"lng":120.583},{"name":"Laoac","province":"Pangasinan","region":"Ilocos Region","lat":16.1167,"lng":120.0},{"name":"Basco","province":"Batanes","region":"Cagayan Valley","lat":20.4496778,"lng":121.9698694},{"name":"Itbayat","province":"Batanes","region":"Cagayan Valley","lat":20.767,"lng":121.85},{"name":"Ivana","province":"Batanes","region":"Cagayan Valley","lat":20.367,"lng":121.917},{"name":"Mahatao","province":"Batanes","region":"Cagayan Valley","lat":20.417,"lng":121.95},{"name":"Sabtang","province":"Batanes","region":"Cagayan Valley","lat":20.333,"lng":121.867},{"name":"Uyugan","province":"Batanes","region":"Cagayan Valley","lat":20.35,"lng":121.933},{"name":"Abulug","province":"Cagayan","region":"Cagayan Valley","lat":18.45,"lng":121.45},{"name":"Alcala","province":"Cagayan","region":"Cagayan Valley","lat":17.9,"lng":121.65},{"name":"Allacapan","province":"Cagayan","region":"Cagayan Valley","lat":18.25,"lng":121.583},{"name":"Amulung","province":"Cagayan","region":"Cagayan Valley","lat":17.833,"lng":121.733},{"name":"Aparri","province":"Cagayan","region":"Cagayan Valley","lat":18.333,"lng":121.667},{"name":"Baggao","province":"Cagayan","region":"Cagayan Valley","lat":17.917,"lng":121.967},{"name":"Ballesteros","province":"Cagayan","region":"Cagayan Valley","lat":18.4,"lng":121.517},{"name":"Buguey","province":"Cagayan","region":"Cagayan Valley","lat":18.283,"lng":121.833},{"name":"Calayan","province":"Cagayan","region":"Cagayan Valley","lat":19.267,"lng":121.483},{"name":"Camalaniugan","province":"Cagayan","region":"Cagayan Valley","lat":18.27444,"lng":121.67361},{"name":"Claveria","province":"Cagayan","region":"Cagayan Valley","lat":18.6075,"lng":121.085},{"name":"Enrile","province":"Cagayan","region":"Cagayan Valley","lat":17.55,"lng":121.7},{"name":"Gattaran","province":"Cagayan","region":"Cagayan Valley","lat":18.067,"lng":121.65},{"name":"Gonzaga","province":"Cagayan","region":"Cagayan Valley","lat":18.267,"lng":122.0},{"name":"Iguig","province":"Cagayan","region":"Cagayan Valley","lat":17.75,"lng":121.733},{"name":"Lal-Lo","province":"Cagayan","region":"Cagayan Valley","lat":18.2,"lng":121.667},{"name":"Lasam","province":"Cagayan","region":"Cagayan Valley","lat":18.067,"lng":121.6},{"name":"Pamplona","province":"Cagayan","region":"Cagayan Valley","lat":18.45,"lng":121.34167},{"name":"Peñablanca","province":"Cagayan","region":"Cagayan Valley","lat":17.633,"lng":121.783},{"name":"Piat","province":"Cagayan","region":"Cagayan Valley","lat":17.79111,"lng":121.47611},{"name":"Rizal","province":"Cagayan","region":"Cagayan Valley","lat":17.85,"lng":121.35},{"name":"Sanchez-Mira","province":"Cagayan","region":"Cagayan Valley","lat":18.567,"lng":121.233},{"name":"Santa Ana","province":"Cagayan","region":"Cagayan Valley","lat":18.467,"lng":122.15},{"name":"Santa Praxedes","province":"Cagayan","region":"Cagayan Valley","lat":18.567,"lng":121.0},{"name":"Santa Teresita","province":"Cagayan","region":"Cagayan Valley","lat":18.25,"lng":121.883},{"name":"Santo Niño (Faire)","province":"Cagayan","region":"Cagayan Valley","lat":17.883,"lng":121.567},{"name":"Solana","province":"Cagayan","region":"Cagayan Valley","lat":17.655,"lng":121.68889},{"name":"Tuao","province":"Cagayan","region":"Cagayan Valley","lat":17.733,"lng":121.45},{"name":"Tuguegarao City","province":"Cagayan","region":"Cagayan Valley","lat":17.617,"lng":121.717},{"name":"Alicia","province":"Isabela","region":"Cagayan Valley","lat":16.783,"lng":121.7},{"name":"Angadanan","province":"Isabela","region":"Cagayan Valley","lat":16.75,"lng":121.75},{"name":"Aurora","province":"Isabela","region":"Cagayan Valley","lat":16.99194,"lng":121.63694},{"name":"Benito Soliven","province":"Isabela","region":"Cagayan Valley","lat":16.983,"lng":121.95},{"name":"Burgos","province":"Isabela","region":"Cagayan Valley","lat":17.067,"lng":121.7},{"name":"Cabagan","province":"Isabela","region":"Cagayan Valley","lat":17.433,"lng":121.767},{"name":"Cabatuan","province":"Isabela","region":"Cagayan Valley","lat":16.95889,"lng":121.66917},{"name":"Cauayan","province":"Isabela","region":"Cagayan Valley","lat":13.2937,"lng":123.8982},{"name":"Cordon","province":"Isabela","region":"Cagayan Valley","lat":16.667,"lng":121.45},{"name":"Dinapigue","province":"Isabela","region":"Cagayan Valley","lat":16.667,"lng":122.35},{"name":"Divilacan","province":"Isabela","region":"Cagayan Valley","lat":17.333,"lng":122.3},{"name":"Echague","province":"Isabela","region":"Cagayan Valley","lat":16.7,"lng":121.65},{"name":"Gamu","province":"Isabela","region":"Cagayan Valley","lat":17.05,"lng":121.833},{"name":"Ilagan City","province":"Isabela","region":"Cagayan Valley","lat":17.13,"lng":121.88},{"name":"Jones","province":"Isabela","region":"Cagayan Valley","lat":16.55806,"lng":121.70694},{"name":"Luna","province":"Isabela","region":"Cagayan Valley","lat":16.967,"lng":121.733},{"name":"Maconacon","province":"Isabela","region":"Cagayan Valley","lat":17.433,"lng":122.233},{"name":"Delfin Albano (Magsaysay)","province":"Isabela","region":"Cagayan Valley","lat":10.867,"lng":121.05},{"name":"Mallig","province":"Isabela","region":"Cagayan Valley","lat":17.2,"lng":121.617},{"name":"Naguilian","province":"Isabela","region":"Cagayan Valley","lat":17.02667,"lng":121.835},{"name":"Palanan","province":"Isabela","region":"Cagayan Valley","lat":17.05889,"lng":122.43},{"name":"Quezon","province":"Isabela","region":"Cagayan Valley","lat":16.697,"lng":121.6295},{"name":"Quirino","province":"Isabela","region":"Cagayan Valley","lat":17.133,"lng":121.7},{"name":"Ramon","province":"Isabela","region":"Cagayan Valley","lat":16.783,"lng":121.533},{"name":"Reina Mercedes","province":"Isabela","region":"Cagayan Valley","lat":16.983,"lng":121.783},{"name":"Roxas","province":"Isabela","region":"Cagayan Valley","lat":17.117,"lng":121.617},{"name":"San Agustin","province":"Isabela","region":"Cagayan Valley","lat":16.517,"lng":121.75},{"name":"San Guillermo","province":"Isabela","region":"Cagayan Valley","lat":16.767,"lng":121.8},{"name":"San Isidro","province":"Isabela","region":"Cagayan Valley","lat":16.867,"lng":121.767},{"name":"San Manuel","province":"Isabela","region":"Cagayan Valley","lat":17.017,"lng":121.633},{"name":"San Mariano","province":"Isabela","region":"Cagayan Valley","lat":16.983,"lng":122.017},{"name":"San Mateo","province":"Isabela","region":"Cagayan Valley","lat":16.883,"lng":121.583},{"name":"San Pablo","province":"Isabela","region":"Cagayan Valley","lat":17.467,"lng":121.983},{"name":"Santa Maria","province":"Isabela","region":"Cagayan Valley","lat":17.467,"lng":121.75},{"name":"Santiago","province":"Isabela","region":"Cagayan Valley","lat":17.3,"lng":120.45},{"name":"Santo Tomas","province":"Isabela","region":"Cagayan Valley","lat":17.4,"lng":121.767},{"name":"Tumauini","province":"Isabela","region":"Cagayan Valley","lat":17.267,"lng":121.8},{"name":"Ambaguio","province":"Nueva Vizcaya","region":"Cagayan Valley","lat":16.517,"lng":121.017},{"name":"Aritao","province":"Nueva Vizcaya","region":"Cagayan Valley","lat":16.3,"lng":121.033},{"name":"Bagabag","province":"Nueva Vizcaya","region":"Cagayan Valley","lat":16.6,"lng":121.267},{"name":"Bambang","province":"Nueva Vizcaya","region":"Cagayan Valley","lat":16.383,"lng":121.117},{"name":"Bayombong","province":"Nueva Vizcaya","region":"Cagayan Valley","lat":16.483,"lng":121.15},{"name":"Diadi","province":"Nueva Vizcaya","region":"Cagayan Valley","lat":16.633,"lng":121.35},{"name":"Dupax Del Norte","province":"Nueva Vizcaya","region":"Cagayan Valley","lat":16.28639,"lng":121.09417},{"name":"Dupax Del Sur","province":"Nueva Vizcaya","region":"Cagayan Valley","lat":16.283,"lng":121.1},{"name":"Kasibu","province":"Nueva Vizcaya","region":"Cagayan Valley","lat":16.317,"lng":121.283},{"name":"Kayapa","province":"Nueva Vizcaya","region":"Cagayan Valley","lat":16.417,"lng":120.917},{"name":"Quezon","province":"Nueva Vizcaya","region":"Cagayan Valley","lat":16.5,"lng":121.267},{"name":"Santa Fe","province":"Nueva Vizcaya","region":"Cagayan Valley","lat":16.16194,"lng":120.93889},{"name":"Solano","province":"Nueva Vizcaya","region":"Cagayan Valley","lat":16.52389,"lng":121.19194},{"name":"Villaverde","province":"Nueva Vizcaya","region":"Cagayan Valley","lat":16.583,"lng":121.2},{"name":"Alfonso Castaneda","province":"Nueva Vizcaya","region":"Cagayan Valley","lat":15.8,"lng":121.3},{"name":"Aglipay","province":"Quirino","region":"Cagayan Valley","lat":16.467,"lng":121.65},{"name":"Cabarroguis","province":"Quirino","region":"Cagayan Valley","lat":16.583,"lng":121.5},{"name":"Diffun","province":"Quirino","region":"Cagayan Valley","lat":16.6,"lng":121.467},{"name":"Maddela","province":"Quirino","region":"Cagayan Valley","lat":16.35,"lng":121.7},{"name":"Saguday","province":"Quirino","region":"Cagayan Valley","lat":16.517,"lng":121.6},{"name":"Nagtipunan","province":"Quirino","region":"Cagayan Valley","lat":16.217,"lng":121.6},{"name":"Abucay","province":"Bataan","region":"Central Luzon","lat":14.733,"lng":120.533},{"name":"Bagac","province":"Bataan","region":"Central Luzon","lat":14.6,"lng":120.4},{"name":"Balanga","province":"Bataan","region":"Central Luzon","lat":14.6764,"lng":120.5364},{"name":"Dinalupihan","province":"Bataan","region":"Central Luzon","lat":14.883,"lng":120.467},{"name":"Hermosa","province":"Bataan","region":"Central Luzon","lat":14.833,"lng":120.5},{"name":"Limay","province":"Bataan","region":"Central Luzon","lat":14.567,"lng":120.6},{"name":"Mariveles","province":"Bataan","region":"Central Luzon","lat":14.433,"lng":120.483},{"name":"Morong","province":"Bataan","region":"Central Luzon","lat":14.683,"lng":120.267},{"name":"Orani","province":"Bataan","region":"Central Luzon","lat":14.8,"lng":120.533},{"name":"Orion","province":"Bataan","region":"Central Luzon","lat":14.617,"lng":120.583},{"name":"Pilar","province":"Bataan","region":"Central Luzon","lat":14.667,"lng":120.567},{"name":"Samal","province":"Bataan","region":"Central Luzon","lat":14.767,"lng":120.55},{"name":"Angat","province":"Bulacan","region":"Central Luzon","lat":14.933,"lng":121.033},{"name":"Balagtas (Bigaa)","province":"Bulacan","region":"Central Luzon","lat":14.817,"lng":120.867},{"name":"Baliuag","province":"Bulacan","region":"Central Luzon","lat":14.95,"lng":120.883},{"name":"Bocaue","province":"Bulacan","region":"Central Luzon","lat":14.8,"lng":120.933},{"name":"Bulacan","province":"Bulacan","region":"Central Luzon","lat":14.79306,"lng":120.87889},{"name":"Bustos","province":"Bulacan","region":"Central Luzon","lat":14.95,"lng":120.917},{"name":"Calumpit","province":"Bulacan","region":"Central Luzon","lat":14.917,"lng":120.767},{"name":"Guiguinto","province":"Bulacan","region":"Central Luzon","lat":14.833,"lng":120.883},{"name":"Hagonoy","province":"Bulacan","region":"Central Luzon","lat":14.833,"lng":120.733},{"name":"Malolos","province":"Bulacan","region":"Central Luzon","lat":14.84333,"lng":120.81139},{"name":"Marilao","province":"Bulacan","region":"Central Luzon","lat":14.75806,"lng":120.94806},{"name":"Meycauayan","province":"Bulacan","region":"Central Luzon","lat":14.733,"lng":120.95},{"name":"Norzagaray","province":"Bulacan","region":"Central Luzon","lat":14.917,"lng":121.05},{"name":"Obando","province":"Bulacan","region":"Central Luzon","lat":14.7,"lng":120.917},{"name":"Pandi","province":"Bulacan","region":"Central Luzon","lat":14.867,"lng":120.95},{"name":"Paombong","province":"Bulacan","region":"Central Luzon","lat":14.83111,"lng":120.78917},{"name":"Plaridel","province":"Bulacan","region":"Central Luzon","lat":14.883,"lng":120.85},{"name":"Pulilan","province":"Bulacan","region":"Central Luzon","lat":14.9,"lng":120.85},{"name":"San Ildefonso","province":"Bulacan","region":"Central Luzon","lat":15.07889,"lng":120.94194},{"name":"San Jose Del Monte","province":"Bulacan","region":"Central Luzon","lat":14.81389,"lng":121.04528},{"name":"San Miguel","province":"Bulacan","region":"Central Luzon","lat":15.14583,"lng":120.97833},{"name":"San Rafael","province":"Bulacan","region":"Central Luzon","lat":14.95,"lng":120.967},{"name":"Santa Maria","province":"Bulacan","region":"Central Luzon","lat":14.817,"lng":120.95},{"name":"Doña Remedios Trinidad","province":"Bulacan","region":"Central Luzon","lat":15.0,"lng":121.083},{"name":"Aliaga","province":"Nueva Ecija","region":"Central Luzon","lat":15.5,"lng":120.84389},{"name":"Bongabon","province":"Nueva Ecija","region":"Central Luzon","lat":15.63111,"lng":121.14389},{"name":"Cabanatuan City","province":"Nueva Ecija","region":"Central Luzon","lat":15.48,"lng":120.97},{"name":"Cabiao","province":"Nueva Ecija","region":"Central Luzon","lat":15.25,"lng":120.85},{"name":"Carranglan","province":"Nueva Ecija","region":"Central Luzon","lat":15.967,"lng":121.067},{"name":"Cuyapo","province":"Nueva Ecija","region":"Central Luzon","lat":15.783,"lng":120.667},{"name":"Gabaldon (Bitulok & Sabani)","province":"Nueva Ecija","region":"Central Luzon","lat":15.533,"lng":121.317},{"name":"Gapan","province":"Nueva Ecija","region":"Central Luzon","lat":15.283,"lng":120.967},{"name":"General Mamerto Natividad","province":"Nueva Ecija","region":"Central Luzon","lat":15.6,"lng":121.05},{"name":"General Tinio (Papaya)","province":"Nueva Ecija","region":"Central Luzon","lat":15.35,"lng":121.05},{"name":"Guimba","province":"Nueva Ecija","region":"Central Luzon","lat":15.65806,"lng":120.76889},{"name":"Jaen","province":"Nueva Ecija","region":"Central Luzon","lat":15.333,"lng":120.9},{"name":"Laur","province":"Nueva Ecija","region":"Central Luzon","lat":15.583,"lng":121.183},{"name":"Licab","province":"Nueva Ecija","region":"Central Luzon","lat":15.55,"lng":120.767},{"name":"Llanera","province":"Nueva Ecija","region":"Central Luzon","lat":15.667,"lng":121.017},{"name":"Lupao","province":"Nueva Ecija","region":"Central Luzon","lat":15.883,"lng":120.9},{"name":"Science City Of Muñoz","province":"Nueva Ecija","region":"Central Luzon","lat":15.717,"lng":120.9},{"name":"Nampicuan","province":"Nueva Ecija","region":"Central Luzon","lat":15.733,"lng":120.633},{"name":"Palayan City","province":"Nueva Ecija","region":"Central Luzon","lat":15.533,"lng":121.083},{"name":"Pantabangan","province":"Nueva Ecija","region":"Central Luzon","lat":15.817,"lng":121.15},{"name":"Peñaranda","province":"Nueva Ecija","region":"Central Luzon","lat":15.35,"lng":121.0},{"name":"Quezon","province":"Nueva Ecija","region":"Central Luzon","lat":15.55,"lng":120.817},{"name":"Rizal","province":"Nueva Ecija","region":"Central Luzon","lat":15.683,"lng":121.167},{"name":"San Antonio","province":"Nueva Ecija","region":"Central Luzon","lat":15.383,"lng":120.8},{"name":"San Isidro","province":"Nueva Ecija","region":"Central Luzon","lat":15.267,"lng":120.9},{"name":"San Jose City","province":"Nueva Ecija","region":"Central Luzon","lat":15.783,"lng":121.0},{"name":"San Leonardo","province":"Nueva Ecija","region":"Central Luzon","lat":15.367,"lng":120.967},{"name":"Santa Rosa","province":"Nueva Ecija","region":"Central Luzon","lat":15.42389,"lng":120.93889},{"name":"Santo Domingo","province":"Nueva Ecija","region":"Central Luzon","lat":15.583,"lng":120.867},{"name":"Talavera","province":"Nueva Ecija","region":"Central Luzon","lat":15.583,"lng":120.917},{"name":"Talugtug","province":"Nueva Ecija","region":"Central Luzon","lat":15.77889,"lng":120.81111},{"name":"Zaragoza","province":"Nueva Ecija","region":"Central Luzon","lat":15.45306,"lng":120.79111},{"name":"Angeles City","province":"Pampanga","region":"Central Luzon","lat":14.1701,"lng":121.3044},{"name":"Apalit","province":"Pampanga","region":"Central Luzon","lat":14.95,"lng":120.767},{"name":"Arayat","province":"Pampanga","region":"Central Luzon","lat":15.15,"lng":120.767},{"name":"Bacolor","province":"Pampanga","region":"Central Luzon","lat":15.0,"lng":120.65},{"name":"Candaba","province":"Pampanga","region":"Central Luzon","lat":15.09333,"lng":120.82833},{"name":"Floridablanca","province":"Pampanga","region":"Central Luzon","lat":14.933,"lng":120.5},{"name":"Guagua","province":"Pampanga","region":"Central Luzon","lat":14.967,"lng":120.633},{"name":"Lubao","province":"Pampanga","region":"Central Luzon","lat":14.933,"lng":120.6},{"name":"Mabalacat City","province":"Pampanga","region":"Central Luzon","lat":15.217,"lng":120.583},{"name":"Macabebe","province":"Pampanga","region":"Central Luzon","lat":14.90806,"lng":120.71556},{"name":"Magalang","province":"Pampanga","region":"Central Luzon","lat":15.217,"lng":120.667},{"name":"Masantol","province":"Pampanga","region":"Central Luzon","lat":14.9,"lng":120.717},{"name":"Mexico","province":"Pampanga","region":"Central Luzon","lat":15.067,"lng":120.717},{"name":"Minalin","province":"Pampanga","region":"Central Luzon","lat":14.967,"lng":120.683},{"name":"Porac","province":"Pampanga","region":"Central Luzon","lat":15.07194,"lng":120.54194},{"name":"San Fernando","province":"Pampanga","region":"Central Luzon","lat":16.7847,"lng":121.7181},{"name":"San Luis","province":"Pampanga","region":"Central Luzon","lat":15.04,"lng":120.79194},{"name":"San Simon","province":"Pampanga","region":"Central Luzon","lat":14.99306,"lng":120.77694},{"name":"Santa Ana","province":"Pampanga","region":"Central Luzon","lat":15.09389,"lng":120.76806},{"name":"Santa Rita","province":"Pampanga","region":"Central Luzon","lat":11.467,"lng":124.95},{"name":"Santo Tomas","province":"Pampanga","region":"Central Luzon","lat":15.71194,"lng":120.58472},{"name":"Sasmuan (Sexmoan)","province":"Pampanga","region":"Central Luzon","lat":14.933,"lng":120.617},{"name":"Anao","province":"Tarlac","region":"Central Luzon","lat":15.72889,"lng":120.62611},{"name":"Bamban","province":"Tarlac","region":"Central Luzon","lat":15.283,"lng":120.567},{"name":"Camiling","province":"Tarlac","region":"Central Luzon","lat":15.7,"lng":120.417},{"name":"Capas","province":"Tarlac","region":"Central Luzon","lat":15.3275,"lng":120.59083},{"name":"Concepcion","province":"Tarlac","region":"Central Luzon","lat":15.317,"lng":120.65},{"name":"Gerona","province":"Tarlac","region":"Central Luzon","lat":15.6,"lng":120.6},{"name":"La Paz","province":"Tarlac","region":"Central Luzon","lat":15.44306,"lng":120.72889},{"name":"Mayantoc","province":"Tarlac","region":"Central Luzon","lat":15.617,"lng":120.383},{"name":"Moncada","province":"Tarlac","region":"Central Luzon","lat":15.733,"lng":120.567},{"name":"Paniqui","province":"Tarlac","region":"Central Luzon","lat":15.667,"lng":120.583},{"name":"Pura","province":"Tarlac","region":"Central Luzon","lat":15.625,"lng":120.65},{"name":"Ramos","province":"Tarlac","region":"Central Luzon","lat":15.66667,"lng":120.64167},{"name":"San Clemente","province":"Tarlac","region":"Central Luzon","lat":15.717,"lng":120.367},{"name":"San Manuel","province":"Tarlac","region":"Central Luzon","lat":15.833,"lng":120.583},{"name":"Santa Ignacia","province":"Tarlac","region":"Central Luzon","lat":15.617,"lng":120.433},{"name":"Tarlac","province":"Tarlac","region":"Central Luzon","lat":15.467,"lng":120.583},{"name":"Victoria","province":"Tarlac","region":"Central Luzon","lat":15.57806,"lng":120.68194},{"name":"San Jose","province":"Tarlac","region":"Central Luzon","lat":15.4,"lng":120.333},{"name":"Botolan","province":"Zambales","region":"Central Luzon","lat":15.283,"lng":120.017},{"name":"Cabangan","province":"Zambales","region":"Central Luzon","lat":15.133,"lng":120.15},{"name":"Candelaria","province":"Zambales","region":"Central Luzon","lat":15.633,"lng":119.933},{"name":"Castillejos","province":"Zambales","region":"Central Luzon","lat":14.933,"lng":120.2},{"name":"Iba","province":"Zambales","region":"Central Luzon","lat":15.333,"lng":119.983},{"name":"Masinloc","province":"Zambales","region":"Central Luzon","lat":15.533,"lng":119.95},{"name":"Olongapo City","province":"Zambales","region":"Central Luzon","lat":14.5959,"lng":120.8904},{"name":"Palauig","province":"Zambales","region":"Central Luzon","lat":15.433,"lng":120.05},{"name":"San Antonio","province":"Zambales","region":"Central Luzon","lat":12.9222,"lng":123.7233},{"name":"San Felipe","province":"Zambales","region":"Central Luzon","lat":15.06194,"lng":120.07},{"name":"San Marcelino","province":"Zambales","region":"Central Luzon","lat":14.967,"lng":120.15},{"name":"San Narciso","province":"Zambales","region":"Central Luzon","lat":15.017,"lng":120.083},{"name":"Santa Cruz","province":"Zambales","region":"Central Luzon","lat":14.5619,"lng":121.0799},{"name":"Subic","province":"Zambales","region":"Central Luzon","lat":14.9,"lng":120.233},{"name":"Baler","province":"Aurora","region":"Central Luzon","lat":15.767,"lng":121.567},{"name":"Casiguran","province":"Aurora","region":"Central Luzon","lat":16.28333,"lng":122.04444},{"name":"Dilasag","province":"Aurora","region":"Central Luzon","lat":16.4,"lng":122.217},{"name":"Dinalungan","province":"Aurora","region":"Central Luzon","lat":16.1,"lng":121.77389},{"name":"Dingalan","province":"Aurora","region":"Central Luzon","lat":15.383,"lng":121.4},{"name":"Dipaculao","province":"Aurora","region":"Central Luzon","lat":15.983,"lng":121.633},{"name":"Maria Aurora","province":"Aurora","region":"Central Luzon","lat":15.783,"lng":121.467},{"name":"San Luis","province":"Aurora","region":"Central Luzon","lat":15.717,"lng":121.517},{"name":"Agoncillo","province":"Batangas","region":"CALABARZON","lat":13.933,"lng":120.933},{"name":"Alitagtag","province":"Batangas","region":"CALABARZON","lat":13.867,"lng":121.0},{"name":"Balayan","province":"Batangas","region":"CALABARZON","lat":13.933,"lng":120.733},{"name":"Balete","province":"Batangas","region":"CALABARZON","lat":14.02722,"lng":121.09806},{"name":"Batangas City","province":"Batangas","region":"CALABARZON","lat":13.75,"lng":121.05},{"name":"Bauan","province":"Batangas","region":"CALABARZON","lat":13.80194,"lng":121.01306},{"name":"Calaca","province":"Batangas","region":"CALABARZON","lat":13.967,"lng":120.8},{"name":"Calatagan","province":"Batangas","region":"CALABARZON","lat":13.833,"lng":120.633},{"name":"Cuenca","province":"Batangas","region":"CALABARZON","lat":13.91667,"lng":121.04472},{"name":"Ibaan","province":"Batangas","region":"CALABARZON","lat":13.817,"lng":121.133},{"name":"Laurel","province":"Batangas","region":"CALABARZON","lat":14.05,"lng":120.9},{"name":"Lemery","province":"Batangas","region":"CALABARZON","lat":13.92,"lng":120.88},{"name":"Lian","province":"Batangas","region":"CALABARZON","lat":14.033,"lng":120.65},{"name":"Lipa City","province":"Batangas","region":"CALABARZON","lat":13.9411,"lng":121.1622},{"name":"Lobo","province":"Batangas","region":"CALABARZON","lat":13.65,"lng":121.25},{"name":"Mabini","province":"Batangas","region":"CALABARZON","lat":13.717,"lng":120.9},{"name":"Malvar","province":"Batangas","region":"CALABARZON","lat":14.04056,"lng":121.15444},{"name":"Mataasnakahoy","province":"Batangas","region":"CALABARZON","lat":13.9694,"lng":121.1472},{"name":"Nasugbu","province":"Batangas","region":"CALABARZON","lat":14.067,"lng":120.633},{"name":"Padre Garcia","province":"Batangas","region":"CALABARZON","lat":13.883,"lng":121.217},{"name":"Rosario","province":"Batangas","region":"CALABARZON","lat":13.85,"lng":121.2},{"name":"San Jose","province":"Batangas","region":"CALABARZON","lat":13.87722,"lng":121.105},{"name":"San Juan","province":"Batangas","region":"CALABARZON","lat":13.833,"lng":121.4},{"name":"San Luis","province":"Batangas","region":"CALABARZON","lat":13.833,"lng":120.933},{"name":"San Nicolas","province":"Batangas","region":"CALABARZON","lat":13.917,"lng":120.95},{"name":"San Pascual","province":"Batangas","region":"CALABARZON","lat":13.8075,"lng":121.04194},{"name":"Santa Teresita","province":"Batangas","region":"CALABARZON","lat":13.883,"lng":120.967},{"name":"Santo Tomas","province":"Batangas","region":"CALABARZON","lat":14.10917,"lng":121.14194},{"name":"Taal","province":"Batangas","region":"CALABARZON","lat":13.89417,"lng":120.92917},{"name":"Talisay","province":"Batangas","region":"CALABARZON","lat":14.1,"lng":121.017},{"name":"Tanauan","province":"Batangas","region":"CALABARZON","lat":11.12,"lng":125.02},{"name":"Taysan","province":"Batangas","region":"CALABARZON","lat":13.74194,"lng":121.22306},{"name":"Tingloy","province":"Batangas","region":"CALABARZON","lat":13.65,"lng":120.867},{"name":"Tuy","province":"Batangas","region":"CALABARZON","lat":14.017,"lng":120.733},{"name":"Alfonso","province":"Cavite","region":"CALABARZON","lat":14.14083,"lng":120.85389},{"name":"Amadeo","province":"Cavite","region":"CALABARZON","lat":14.167,"lng":120.917},{"name":"Bacoor City","province":"Cavite","region":"CALABARZON","lat":14.45,"lng":120.95},{"name":"Carmona","province":"Cavite","region":"CALABARZON","lat":14.317,"lng":121.05},{"name":"Cavite City","province":"Cavite","region":"CALABARZON","lat":14.483,"lng":120.9},{"name":"Dasmariñas","province":"Cavite","region":"CALABARZON","lat":14.32639,"lng":120.93611},{"name":"General Emilio Aguinaldo","province":"Cavite","region":"CALABARZON","lat":14.183,"lng":120.8},{"name":"General Trias","province":"Cavite","region":"CALABARZON","lat":14.383,"lng":120.883},{"name":"Imus City","province":"Cavite","region":"CALABARZON","lat":14.4,"lng":120.933},{"name":"Indang","province":"Cavite","region":"CALABARZON","lat":14.19528,"lng":120.87694},{"name":"Kawit","province":"Cavite","region":"CALABARZON","lat":14.433,"lng":120.9},{"name":"Magallanes","province":"Cavite","region":"CALABARZON","lat":14.18833,"lng":120.7575},{"name":"Maragondon","province":"Cavite","region":"CALABARZON","lat":14.27333,"lng":120.73833},{"name":"Mendez (Mendez-Nuñez)","province":"Cavite","region":"CALABARZON","lat":14.12861,"lng":120.90583},{"name":"Naic","province":"Cavite","region":"CALABARZON","lat":14.317,"lng":120.767},{"name":"Noveleta","province":"Cavite","region":"CALABARZON","lat":14.433,"lng":120.883},{"name":"Rosario","province":"Cavite","region":"CALABARZON","lat":14.417,"lng":120.85},{"name":"Silang","province":"Cavite","region":"CALABARZON","lat":14.233,"lng":120.983},{"name":"Tagaytay City","province":"Cavite","region":"CALABARZON","lat":14.1,"lng":120.933},{"name":"Tanza","province":"Cavite","region":"CALABARZON","lat":14.4,"lng":120.833},{"name":"Ternate","province":"Cavite","region":"CALABARZON","lat":14.283,"lng":120.717},{"name":"Trece Martires City","province":"Cavite","region":"CALABARZON","lat":14.283,"lng":120.85},{"name":"Gen. Mariano Alvarez","province":"Cavite","region":"CALABARZON","lat":14.3028,"lng":120.9933},{"name":"Alaminos","province":"Laguna","region":"CALABARZON","lat":14.06306,"lng":121.24806},{"name":"Bay","province":"Laguna","region":"CALABARZON","lat":14.183,"lng":121.283},{"name":"Biñan","province":"Laguna","region":"CALABARZON","lat":14.33,"lng":121.08},{"name":"Cabuyao City","province":"Laguna","region":"CALABARZON","lat":14.1667,"lng":121.4167},{"name":"Calamba","province":"Laguna","region":"CALABARZON","lat":8.55833,"lng":123.64167},{"name":"Calauan","province":"Laguna","region":"CALABARZON","lat":14.15,"lng":121.317},{"name":"Cavinti","province":"Laguna","region":"CALABARZON","lat":14.25,"lng":121.517},{"name":"Famy","province":"Laguna","region":"CALABARZON","lat":14.433,"lng":121.45},{"name":"Kalayaan","province":"Laguna","region":"CALABARZON","lat":14.35,"lng":121.567},{"name":"Liliw","province":"Laguna","region":"CALABARZON","lat":14.133,"lng":121.433},{"name":"Los Baños","province":"Laguna","region":"CALABARZON","lat":14.167,"lng":121.217},{"name":"Luisiana","province":"Laguna","region":"CALABARZON","lat":14.183,"lng":121.517},{"name":"Lumban","province":"Laguna","region":"CALABARZON","lat":14.29806,"lng":121.46},{"name":"Mabitac","province":"Laguna","region":"CALABARZON","lat":14.4275,"lng":121.42667},{"name":"Magdalena","province":"Laguna","region":"CALABARZON","lat":14.2,"lng":121.433},{"name":"Majayjay","province":"Laguna","region":"CALABARZON","lat":14.15,"lng":121.467},{"name":"Nagcarlan","province":"Laguna","region":"CALABARZON","lat":14.133,"lng":121.417},{"name":"Paete","province":"Laguna","region":"CALABARZON","lat":14.367,"lng":121.483},{"name":"Pagsanjan","province":"Laguna","region":"CALABARZON","lat":14.27306,"lng":121.45389},{"name":"Pakil","province":"Laguna","region":"CALABARZON","lat":14.383,"lng":121.483},{"name":"Pangil","province":"Laguna","region":"CALABARZON","lat":14.40306,"lng":121.46611},{"name":"Pila","province":"Laguna","region":"CALABARZON","lat":14.233,"lng":121.367},{"name":"Rizal","province":"Laguna","region":"CALABARZON","lat":14.10917,"lng":121.39444},{"name":"San Pablo City","province":"Laguna","region":"CALABARZON","lat":14.07,"lng":121.32},{"name":"San Pedro","province":"Laguna","region":"CALABARZON","lat":14.3583,"lng":121.0583},{"name":"Santa Cruz","province":"Laguna","region":"CALABARZON","lat":14.27861,"lng":121.41556},{"name":"Santa Maria","province":"Laguna","region":"CALABARZON","lat":14.47,"lng":121.42611},{"name":"Santa Rosa","province":"Laguna","region":"CALABARZON","lat":11.4993,"lng":124.9586},{"name":"Siniloan","province":"Laguna","region":"CALABARZON","lat":14.417,"lng":121.45},{"name":"Victoria","province":"Laguna","region":"CALABARZON","lat":14.22694,"lng":121.32806},{"name":"Agdangan","province":"Quezon","region":"CALABARZON","lat":13.867,"lng":121.917},{"name":"Alabat","province":"Quezon","region":"CALABARZON","lat":14.1,"lng":122.017},{"name":"Atimonan","province":"Quezon","region":"CALABARZON","lat":14.0,"lng":121.917},{"name":"Buenavista","province":"Quezon","region":"CALABARZON","lat":13.1263,"lng":120.6918},{"name":"Burdeos","province":"Quezon","region":"CALABARZON","lat":14.84361,"lng":121.96972},{"name":"Calauag","province":"Quezon","region":"CALABARZON","lat":13.9575,"lng":122.2875},{"name":"Candelaria","province":"Quezon","region":"CALABARZON","lat":15.633,"lng":119.933},{"name":"Catanauan","province":"Quezon","region":"CALABARZON","lat":13.59167,"lng":122.325},{"name":"Dolores","province":"Quezon","region":"CALABARZON","lat":15.5662,"lng":120.8945},{"name":"General Luna","province":"Quezon","region":"CALABARZON","lat":12.2984,"lng":124.6864},{"name":"General Nakar","province":"Quezon","region":"CALABARZON","lat":14.767,"lng":121.617},{"name":"Guinayangan","province":"Quezon","region":"CALABARZON","lat":13.9,"lng":122.45},{"name":"Gumaca","province":"Quezon","region":"CALABARZON","lat":13.917,"lng":122.1},{"name":"Infanta","province":"Quezon","region":"CALABARZON","lat":14.7425,"lng":121.64944},{"name":"Jomalig","province":"Quezon","region":"CALABARZON","lat":14.7125,"lng":122.36972},{"name":"Lopez","province":"Quezon","region":"CALABARZON","lat":13.883,"lng":122.267},{"name":"Lucban","province":"Quezon","region":"CALABARZON","lat":14.11333,"lng":121.55694},{"name":"Lucena City","province":"Quezon","region":"CALABARZON","lat":13.7957,"lng":121.9207},{"name":"Macalelon","province":"Quezon","region":"CALABARZON","lat":13.75,"lng":122.133},{"name":"Mauban","province":"Quezon","region":"CALABARZON","lat":14.183,"lng":121.717},{"name":"Mulanay","province":"Quezon","region":"CALABARZON","lat":13.5,"lng":122.417},{"name":"Padre Burgos","province":"Quezon","region":"CALABARZON","lat":10.033,"lng":125.017},{"name":"Pagbilao","province":"Quezon","region":"CALABARZON","lat":13.967,"lng":121.7},{"name":"Panukulan","province":"Quezon","region":"CALABARZON","lat":14.933,"lng":121.817},{"name":"Patnanungan","province":"Quezon","region":"CALABARZON","lat":14.783,"lng":122.183},{"name":"Perez","province":"Quezon","region":"CALABARZON","lat":14.183,"lng":121.933},{"name":"Pitogo","province":"Quezon","region":"CALABARZON","lat":7.45,"lng":123.317},{"name":"Plaridel","province":"Quezon","region":"CALABARZON","lat":13.95,"lng":122.017},{"name":"Polillo","province":"Quezon","region":"CALABARZON","lat":14.717,"lng":121.95},{"name":"Quezon","province":"Quezon","region":"CALABARZON","lat":16.697,"lng":121.6295},{"name":"Real","province":"Quezon","region":"CALABARZON","lat":14.667,"lng":121.6},{"name":"Sampaloc","province":"Quezon","region":"CALABARZON","lat":14.167,"lng":121.583},{"name":"San Andres","province":"Quezon","region":"CALABARZON","lat":17.1679,"lng":120.4951},{"name":"San Antonio","province":"Quezon","region":"CALABARZON","lat":12.9222,"lng":123.7233},{"name":"San Francisco (Aurora)","province":"Quezon","region":"CALABARZON","lat":7.95,"lng":123.583},{"name":"San Narciso","province":"Quezon","region":"CALABARZON","lat":15.017,"lng":120.083},{"name":"Sariaya","province":"Quezon","region":"CALABARZON","lat":13.967,"lng":121.533},{"name":"Tagkawayan","province":"Quezon","region":"CALABARZON","lat":13.967,"lng":122.533},{"name":"Tayabas","province":"Quezon","region":"CALABARZON","lat":14.017,"lng":121.583},{"name":"Tiaong","province":"Quezon","region":"CALABARZON","lat":13.95,"lng":121.317},{"name":"Unisan","province":"Quezon","region":"CALABARZON","lat":13.833,"lng":121.983},{"name":"Angono","province":"Rizal","region":"CALABARZON","lat":14.533,"lng":121.15},{"name":"Antipolo","province":"Rizal","region":"CALABARZON","lat":14.583,"lng":121.167},{"name":"Baras","province":"Rizal","region":"CALABARZON","lat":14.517,"lng":121.267},{"name":"Binangonan","province":"Rizal","region":"CALABARZON","lat":14.45139,"lng":121.19194},{"name":"Cainta","province":"Rizal","region":"CALABARZON","lat":14.567,"lng":121.117},{"name":"Cardona","province":"Rizal","region":"CALABARZON","lat":14.48611,"lng":121.22889},{"name":"Jala-Jala","province":"Rizal","region":"CALABARZON","lat":14.35306,"lng":121.32222},{"name":"Rodriguez (Montalban)","province":"Rizal","region":"CALABARZON","lat":14.717,"lng":121.117},{"name":"Morong","province":"Rizal","region":"CALABARZON","lat":14.51194,"lng":121.23889},{"name":"Pililla","province":"Rizal","region":"CALABARZON","lat":14.483,"lng":121.3},{"name":"San Mateo","province":"Rizal","region":"CALABARZON","lat":14.717,"lng":121.117},{"name":"Tanay","province":"Rizal","region":"CALABARZON","lat":14.5,"lng":121.283},{"name":"Taytay","province":"Rizal","region":"CALABARZON","lat":14.567,"lng":121.133},{"name":"Teresa","province":"Rizal","region":"CALABARZON","lat":14.567,"lng":121.2},{"name":"Bacacay","province":"Albay","region":"Bicol Region","lat":13.3,"lng":123.8},{"name":"Camalig","province":"Albay","region":"Bicol Region","lat":13.133,"lng":123.667},{"name":"Daraga (Locsin)","province":"Albay","region":"Bicol Region","lat":13.16194,"lng":123.69389},{"name":"Guinobatan","province":"Albay","region":"Bicol Region","lat":13.183,"lng":123.6},{"name":"Jovellar","province":"Albay","region":"Bicol Region","lat":13.067,"lng":123.6},{"name":"Legazpi City","province":"Albay","region":"Bicol Region","lat":13.13,"lng":123.73},{"name":"Libon","province":"Albay","region":"Bicol Region","lat":13.3,"lng":123.433},{"name":"Ligao","province":"Albay","region":"Bicol Region","lat":13.217,"lng":123.517},{"name":"Malilipot","province":"Albay","region":"Bicol Region","lat":13.317,"lng":123.733},{"name":"Malinao","province":"Albay","region":"Bicol Region","lat":13.4,"lng":123.7},{"name":"Manito","province":"Albay","region":"Bicol Region","lat":13.117,"lng":123.867},{"name":"Oas","province":"Albay","region":"Bicol Region","lat":13.25889,"lng":123.49528},{"name":"Pio Duran","province":"Albay","region":"Bicol Region","lat":13.033,"lng":123.45},{"name":"Polangui","province":"Albay","region":"Bicol Region","lat":13.29222,"lng":123.48556},{"name":"Rapu-Rapu","province":"Albay","region":"Bicol Region","lat":13.183,"lng":124.133},{"name":"Santo Domingo (Libog)","province":"Albay","region":"Bicol Region","lat":11.2378,"lng":124.0271},{"name":"Tabaco","province":"Albay","region":"Bicol Region","lat":13.35944,"lng":123.73028},{"name":"Tiwi","province":"Albay","region":"Bicol Region","lat":13.45,"lng":123.683},{"name":"Basud","province":"Camarines Norte","region":"Bicol Region","lat":14.067,"lng":122.967},{"name":"Capalonga","province":"Camarines Norte","region":"Bicol Region","lat":14.333,"lng":122.5},{"name":"Daet","province":"Camarines Norte","region":"Bicol Region","lat":14.117,"lng":122.95},{"name":"San Lorenzo Ruiz (Imelda)","province":"Camarines Norte","region":"Bicol Region","lat":7.617,"lng":122.95},{"name":"Jose Panganiban","province":"Camarines Norte","region":"Bicol Region","lat":14.3,"lng":122.7},{"name":"Labo","province":"Camarines Norte","region":"Bicol Region","lat":14.017,"lng":122.35},{"name":"Mercedes","province":"Camarines Norte","region":"Bicol Region","lat":14.1,"lng":123.017},{"name":"Paracale","province":"Camarines Norte","region":"Bicol Region","lat":14.283,"lng":122.783},{"name":"San Vicente","province":"Camarines Norte","region":"Bicol Region","lat":14.1,"lng":122.867},{"name":"Santa Elena","province":"Camarines Norte","region":"Bicol Region","lat":14.2,"lng":122.383},{"name":"Talisay","province":"Camarines Norte","region":"Bicol Region","lat":14.133,"lng":122.917},{"name":"Vinzons","province":"Camarines Norte","region":"Bicol Region","lat":14.183,"lng":122.9},{"name":"Baao","province":"Camarines Sur","region":"Bicol Region","lat":13.45611,"lng":123.36389},{"name":"Balatan","province":"Camarines Sur","region":"Bicol Region","lat":13.317,"lng":123.233},{"name":"Bato","province":"Camarines Sur","region":"Bicol Region","lat":13.35611,"lng":123.36389},{"name":"Bombon","province":"Camarines Sur","region":"Bicol Region","lat":13.683,"lng":123.2},{"name":"Buhi","province":"Camarines Sur","region":"Bicol Region","lat":13.433,"lng":123.517},{"name":"Bula","province":"Camarines Sur","region":"Bicol Region","lat":13.467,"lng":123.283},{"name":"Cabusao","province":"Camarines Sur","region":"Bicol Region","lat":13.717,"lng":123.1},{"name":"Calabanga","province":"Camarines Sur","region":"Bicol Region","lat":13.717,"lng":123.233},{"name":"Camaligan","province":"Camarines Sur","region":"Bicol Region","lat":13.625,"lng":123.15694},{"name":"Canaman","province":"Camarines Sur","region":"Bicol Region","lat":13.65,"lng":123.167},{"name":"Caramoan","province":"Camarines Sur","region":"Bicol Region","lat":13.767,"lng":123.867},{"name":"Del Gallego","province":"Camarines Sur","region":"Bicol Region","lat":13.917,"lng":122.6},{"name":"Gainza","province":"Camarines Sur","region":"Bicol Region","lat":13.617,"lng":123.15},{"name":"Garchitorena","province":"Camarines Sur","region":"Bicol Region","lat":13.883,"lng":123.7},{"name":"Goa","province":"Camarines Sur","region":"Bicol Region","lat":13.7,"lng":123.5},{"name":"Iriga City","province":"Camarines Sur","region":"Bicol Region","lat":13.417,"lng":123.417},{"name":"Lagonoy","province":"Camarines Sur","region":"Bicol Region","lat":13.73861,"lng":123.52056},{"name":"Libmanan","province":"Camarines Sur","region":"Bicol Region","lat":13.7,"lng":123.067},{"name":"Lupi","province":"Camarines Sur","region":"Bicol Region","lat":13.817,"lng":122.9},{"name":"Magarao","province":"Camarines Sur","region":"Bicol Region","lat":13.667,"lng":123.183},{"name":"Milaor","province":"Camarines Sur","region":"Bicol Region","lat":13.6,"lng":123.183},{"name":"Minalabac","province":"Camarines Sur","region":"Bicol Region","lat":13.567,"lng":123.183},{"name":"Nabua","province":"Camarines Sur","region":"Bicol Region","lat":13.40139,"lng":123.37639},{"name":"Naga City","province":"Camarines Sur","region":"Bicol Region","lat":13.62,"lng":123.17},{"name":"Ocampo","province":"Camarines Sur","region":"Bicol Region","lat":13.567,"lng":123.383},{"name":"Pamplona","province":"Camarines Sur","region":"Bicol Region","lat":13.6,"lng":123.083},{"name":"Pasacao","province":"Camarines Sur","region":"Bicol Region","lat":13.517,"lng":123.05},{"name":"Pili","province":"Camarines Sur","region":"Bicol Region","lat":13.583,"lng":123.3},{"name":"Presentacion (Parubcan)","province":"Camarines Sur","region":"Bicol Region","lat":13.717,"lng":123.75},{"name":"Ragay","province":"Camarines Sur","region":"Bicol Region","lat":13.817,"lng":122.783},{"name":"Sagñay","province":"Camarines Sur","region":"Bicol Region","lat":13.60417,"lng":123.52},{"name":"San Fernando","province":"Camarines Sur","region":"Bicol Region","lat":13.567,"lng":123.15},{"name":"San Jose","province":"Camarines Sur","region":"Bicol Region","lat":13.717,"lng":123.517},{"name":"Sipocot","province":"Camarines Sur","region":"Bicol Region","lat":13.767,"lng":122.983},{"name":"Siruma","province":"Camarines Sur","region":"Bicol Region","lat":14.0,"lng":123.25},{"name":"Tigaon","province":"Camarines Sur","region":"Bicol Region","lat":13.633,"lng":123.5},{"name":"Tinambac","province":"Camarines Sur","region":"Bicol Region","lat":13.817,"lng":123.333},{"name":"Bagamanoc","province":"Catanduanes","region":"Bicol Region","lat":13.933,"lng":124.283},{"name":"Baras","province":"Catanduanes","region":"Bicol Region","lat":13.667,"lng":124.367},{"name":"Bato","province":"Catanduanes","region":"Bicol Region","lat":13.6,"lng":124.3},{"name":"Caramoran","province":"Catanduanes","region":"Bicol Region","lat":13.983,"lng":124.133},{"name":"Gigmoto","province":"Catanduanes","region":"Bicol Region","lat":13.783,"lng":124.383},{"name":"Pandan","province":"Catanduanes","region":"Bicol Region","lat":14.05,"lng":124.167},{"name":"Panganiban (Payo)","province":"Catanduanes","region":"Bicol Region","lat":13.9,"lng":124.3},{"name":"San Andres (Calolbon)","province":"Catanduanes","region":"Bicol Region","lat":13.6,"lng":124.1},{"name":"San Miguel","province":"Catanduanes","region":"Bicol Region","lat":13.633,"lng":124.3},{"name":"Viga","province":"Catanduanes","region":"Bicol Region","lat":13.867,"lng":124.3},{"name":"Virac","province":"Catanduanes","region":"Bicol Region","lat":13.583,"lng":124.233},{"name":"Aroroy","province":"Masbate","region":"Bicol Region","lat":12.5,"lng":123.4},{"name":"Baleno","province":"Masbate","region":"Bicol Region","lat":12.467,"lng":123.483},{"name":"Balud","province":"Masbate","region":"Bicol Region","lat":12.033,"lng":123.2},{"name":"Batuan","province":"Masbate","region":"Bicol Region","lat":12.417,"lng":123.767},{"name":"Cataingan","province":"Masbate","region":"Bicol Region","lat":12.0,"lng":123.983},{"name":"Cawayan","province":"Masbate","region":"Bicol Region","lat":12.033,"lng":123.683},{"name":"Claveria","province":"Masbate","region":"Bicol Region","lat":12.9,"lng":123.25},{"name":"Dimasalang","province":"Masbate","region":"Bicol Region","lat":12.183,"lng":123.867},{"name":"Esperanza","province":"Masbate","region":"Bicol Region","lat":11.733,"lng":124.05},{"name":"Mandaon","province":"Masbate","region":"Bicol Region","lat":12.233,"lng":123.283},{"name":"Masbate","province":"Masbate","region":"Bicol Region","lat":12.17,"lng":123.58},{"name":"Milagros","province":"Masbate","region":"Bicol Region","lat":12.233,"lng":123.5},{"name":"Mobo","province":"Masbate","region":"Bicol Region","lat":12.333,"lng":123.65},{"name":"Monreal","province":"Masbate","region":"Bicol Region","lat":12.633,"lng":123.667},{"name":"Palanas","province":"Masbate","region":"Bicol Region","lat":12.15,"lng":123.917},{"name":"Pio V. Corpuz (Limbuhan)","province":"Masbate","region":"Bicol Region","lat":11.0667,"lng":125.0167},{"name":"Placer","province":"Masbate","region":"Bicol Region","lat":11.867,"lng":123.917},{"name":"San Fernando","province":"Masbate","region":"Bicol Region","lat":12.483,"lng":123.75},{"name":"San Jacinto","province":"Masbate","region":"Bicol Region","lat":12.567,"lng":123.733},{"name":"San Pascual","province":"Masbate","region":"Bicol Region","lat":13.133,"lng":122.983},{"name":"Uson","province":"Masbate","region":"Bicol Region","lat":12.217,"lng":123.783},{"name":"Barcelona","province":"Sorsogon","region":"Bicol Region","lat":12.867,"lng":124.133},{"name":"Bulan","province":"Sorsogon","region":"Bicol Region","lat":12.667,"lng":123.883},{"name":"Bulusan","province":"Sorsogon","region":"Bicol Region","lat":12.75,"lng":124.117},{"name":"Casiguran","province":"Sorsogon","region":"Bicol Region","lat":12.867,"lng":124.017},{"name":"Castilla","province":"Sorsogon","region":"Bicol Region","lat":12.95,"lng":123.883},{"name":"Donsol","province":"Sorsogon","region":"Bicol Region","lat":12.917,"lng":123.6},{"name":"Gubat","province":"Sorsogon","region":"Bicol Region","lat":12.917,"lng":124.117},{"name":"Irosin","province":"Sorsogon","region":"Bicol Region","lat":12.7,"lng":124.033},{"name":"Juban","province":"Sorsogon","region":"Bicol Region","lat":12.85,"lng":123.983},{"name":"Magallanes","province":"Sorsogon","region":"Bicol Region","lat":12.833,"lng":123.85},{"name":"Matnog","province":"Sorsogon","region":"Bicol Region","lat":12.583,"lng":124.083},{"name":"Pilar","province":"Sorsogon","region":"Bicol Region","lat":12.933,"lng":123.683},{"name":"Prieto Diaz","province":"Sorsogon","region":"Bicol Region","lat":13.033,"lng":124.183},{"name":"Santa Magdalena","province":"Sorsogon","region":"Bicol Region","lat":12.65,"lng":124.1},{"name":"Sorsogon","province":"Sorsogon","region":"Bicol Region","lat":12.97,"lng":124.0},{"name":"Altavas","province":"Aklan","region":"Western Visayas","lat":11.533,"lng":122.483},{"name":"Balete","province":"Aklan","region":"Western Visayas","lat":11.55,"lng":122.383},{"name":"Banga","province":"Aklan","region":"Western Visayas","lat":11.633,"lng":122.333},{"name":"Batan","province":"Aklan","region":"Western Visayas","lat":11.583,"lng":122.5},{"name":"Buruanga","province":"Aklan","region":"Western Visayas","lat":11.85,"lng":121.9},{"name":"Ibajay","province":"Aklan","region":"Western Visayas","lat":11.817,"lng":122.167},{"name":"Kalibo","province":"Aklan","region":"Western Visayas","lat":11.7,"lng":122.367},{"name":"Lezo","province":"Aklan","region":"Western Visayas","lat":11.667,"lng":122.333},{"name":"Libacao","province":"Aklan","region":"Western Visayas","lat":11.483,"lng":122.3},{"name":"Madalag","province":"Aklan","region":"Western Visayas","lat":11.517,"lng":122.3},{"name":"Makato","province":"Aklan","region":"Western Visayas","lat":11.7,"lng":122.283},{"name":"Malay","province":"Aklan","region":"Western Visayas","lat":11.9,"lng":121.9083},{"name":"Malinao","province":"Aklan","region":"Western Visayas","lat":11.65,"lng":122.3},{"name":"Nabas","province":"Aklan","region":"Western Visayas","lat":11.833,"lng":122.083},{"name":"New Washington","province":"Aklan","region":"Western Visayas","lat":11.65,"lng":122.433},{"name":"Numancia","province":"Aklan","region":"Western Visayas","lat":11.7,"lng":122.333},{"name":"Tangalan","province":"Aklan","region":"Western Visayas","lat":11.767,"lng":122.25},{"name":"Anini-Y","province":"Antique","region":"Western Visayas","lat":10.433,"lng":121.933},{"name":"Barbaza","province":"Antique","region":"Western Visayas","lat":11.2,"lng":122.05},{"name":"Belison","province":"Antique","region":"Western Visayas","lat":10.717,"lng":122.267},{"name":"Bugasong","province":"Antique","region":"Western Visayas","lat":11.05,"lng":122.067},{"name":"Caluya","province":"Antique","region":"Western Visayas","lat":11.9,"lng":121.517},{"name":"Culasi","province":"Antique","region":"Western Visayas","lat":11.417,"lng":122.067},{"name":"Tobias Fornier (Dao)","province":"Antique","region":"Western Visayas","lat":11.4,"lng":122.683},{"name":"Hamtic","province":"Antique","region":"Western Visayas","lat":10.7,"lng":121.983},{"name":"Laua-An","province":"Antique","region":"Western Visayas","lat":11.15,"lng":122.05},{"name":"Libertad","province":"Antique","region":"Western Visayas","lat":11.783,"lng":121.917},{"name":"Pandan","province":"Antique","region":"Western Visayas","lat":11.717,"lng":122.1},{"name":"Patnongon","province":"Antique","region":"Western Visayas","lat":10.917,"lng":121.983},{"name":"San Jose","province":"Antique","region":"Western Visayas","lat":10.75,"lng":121.95},{"name":"San Remigio","province":"Antique","region":"Western Visayas","lat":10.88,"lng":122.12},{"name":"Sebaste","province":"Antique","region":"Western Visayas","lat":11.583,"lng":122.1},{"name":"Sibalom","province":"Antique","region":"Western Visayas","lat":10.783,"lng":122.017},{"name":"Tibiao","province":"Antique","region":"Western Visayas","lat":11.283,"lng":122.05},{"name":"Valderrama","province":"Antique","region":"Western Visayas","lat":11.0,"lng":122.133},{"name":"Cuartero","province":"Capiz","region":"Western Visayas","lat":11.35,"lng":122.667},{"name":"Dao","province":"Capiz","region":"Western Visayas","lat":11.4,"lng":122.683},{"name":"Dumalag","province":"Capiz","region":"Western Visayas","lat":11.3,"lng":122.617},{"name":"Dumarao","province":"Capiz","region":"Western Visayas","lat":11.267,"lng":122.683},{"name":"Ivisan","province":"Capiz","region":"Western Visayas","lat":11.517,"lng":122.683},{"name":"Jamindan","province":"Capiz","region":"Western Visayas","lat":11.4,"lng":122.5},{"name":"Ma-Ayon","province":"Capiz","region":"Western Visayas","lat":11.383,"lng":122.783},{"name":"Mambusao","province":"Capiz","region":"Western Visayas","lat":11.433,"lng":122.6},{"name":"Panay","province":"Capiz","region":"Western Visayas","lat":11.55,"lng":122.8},{"name":"Panitan","province":"Capiz","region":"Western Visayas","lat":11.467,"lng":122.767},{"name":"Pilar","province":"Capiz","region":"Western Visayas","lat":11.483,"lng":123.0},{"name":"Pontevedra","province":"Capiz","region":"Western Visayas","lat":11.483,"lng":122.833},{"name":"President Roxas","province":"Capiz","region":"Western Visayas","lat":11.433,"lng":122.933},{"name":"Roxas City","province":"Capiz","region":"Western Visayas","lat":11.583,"lng":122.75},{"name":"Sapi-An","province":"Capiz","region":"Western Visayas","lat":11.5,"lng":122.6},{"name":"Sigma","province":"Capiz","region":"Western Visayas","lat":11.417,"lng":122.667},{"name":"Tapaz","province":"Capiz","region":"Western Visayas","lat":11.267,"lng":122.533},{"name":"Ajuy","province":"Iloilo","region":"Western Visayas","lat":11.167,"lng":123.017},{"name":"Alimodian","province":"Iloilo","region":"Western Visayas","lat":10.817,"lng":122.433},{"name":"Anilao","province":"Iloilo","region":"Western Visayas","lat":11.0,"lng":122.717},{"name":"Badiangan","province":"Iloilo","region":"Western Visayas","lat":11.5724,"lng":122.3118},{"name":"Balasan","province":"Iloilo","region":"Western Visayas","lat":11.467,"lng":123.083},{"name":"Banate","province":"Iloilo","region":"Western Visayas","lat":11.05,"lng":122.783},{"name":"Barotac Nuevo","province":"Iloilo","region":"Western Visayas","lat":10.9,"lng":122.7},{"name":"Barotac Viejo","province":"Iloilo","region":"Western Visayas","lat":11.05,"lng":122.85},{"name":"Batad","province":"Iloilo","region":"Western Visayas","lat":11.417,"lng":123.117},{"name":"Bingawan","province":"Iloilo","region":"Western Visayas","lat":11.233,"lng":122.567},{"name":"Cabatuan","province":"Iloilo","region":"Western Visayas","lat":16.95889,"lng":121.66917},{"name":"Calinog","province":"Iloilo","region":"Western Visayas","lat":11.133,"lng":122.5},{"name":"Carles","province":"Iloilo","region":"Western Visayas","lat":11.567,"lng":123.133},{"name":"Concepcion","province":"Iloilo","region":"Western Visayas","lat":6.4541,"lng":124.8801},{"name":"Dingle","province":"Iloilo","region":"Western Visayas","lat":11.05,"lng":122.667},{"name":"Dueñas","province":"Iloilo","region":"Western Visayas","lat":11.067,"lng":122.617},{"name":"Dumangas","province":"Iloilo","region":"Western Visayas","lat":10.833,"lng":122.717},{"name":"Estancia","province":"Iloilo","region":"Western Visayas","lat":11.45,"lng":123.15},{"name":"Guimbal","province":"Iloilo","region":"Western Visayas","lat":10.667,"lng":122.317},{"name":"Igbaras","province":"Iloilo","region":"Western Visayas","lat":10.717,"lng":122.267},{"name":"Iloilo City","province":"Iloilo","region":"Western Visayas","lat":11.6166,"lng":122.5413},{"name":"Janiuay","province":"Iloilo","region":"Western Visayas","lat":10.95,"lng":122.5},{"name":"Lambunao","province":"Iloilo","region":"Western Visayas","lat":11.05,"lng":122.483},{"name":"Leganes","province":"Iloilo","region":"Western Visayas","lat":10.783,"lng":122.583},{"name":"Lemery","province":"Iloilo","region":"Western Visayas","lat":11.233,"lng":122.933},{"name":"Leon","province":"Iloilo","region":"Western Visayas","lat":10.783,"lng":122.383},{"name":"Maasin","province":"Iloilo","region":"Western Visayas","lat":10.883,"lng":122.433},{"name":"Miagao","province":"Iloilo","region":"Western Visayas","lat":10.65,"lng":122.233},{"name":"Mina","province":"Iloilo","region":"Western Visayas","lat":10.933,"lng":122.583},{"name":"New Lucena","province":"Iloilo","region":"Western Visayas","lat":10.883,"lng":122.6},{"name":"Oton","province":"Iloilo","region":"Western Visayas","lat":10.7,"lng":122.467},{"name":"Passi","province":"Iloilo","region":"Western Visayas","lat":10.7167,"lng":122.2667},{"name":"Pavia","province":"Iloilo","region":"Western Visayas","lat":10.775,"lng":122.54194},{"name":"Pototan","province":"Iloilo","region":"Western Visayas","lat":10.95,"lng":122.633},{"name":"San Dionisio","province":"Iloilo","region":"Western Visayas","lat":11.267,"lng":123.083},{"name":"San Enrique","province":"Iloilo","region":"Western Visayas","lat":10.417,"lng":122.85},{"name":"San Joaquin","province":"Iloilo","region":"Western Visayas","lat":15.6,"lng":120.9167},{"name":"San Miguel","province":"Iloilo","region":"Western Visayas","lat":7.65,"lng":123.267},{"name":"San Rafael","province":"Iloilo","region":"Western Visayas","lat":11.167,"lng":122.833},{"name":"Santa Barbara","province":"Iloilo","region":"Western Visayas","lat":16.00306,"lng":120.40083},{"name":"Sara","province":"Iloilo","region":"Western Visayas","lat":11.25,"lng":123.017},{"name":"Tigbauan","province":"Iloilo","region":"Western Visayas","lat":10.717,"lng":122.383},{"name":"Tubungan","province":"Iloilo","region":"Western Visayas","lat":10.783,"lng":122.3},{"name":"Zarraga","province":"Iloilo","region":"Western Visayas","lat":10.817,"lng":122.6},{"name":"Bacolod City","province":"Negros Occidental","region":"Western Visayas","lat":12.5323,"lng":122.343},{"name":"Bago City","province":"Negros Occidental","region":"Western Visayas","lat":13.8081,"lng":121.1175},{"name":"Binalbagan","province":"Negros Occidental","region":"Western Visayas","lat":10.2,"lng":122.867},{"name":"Cadiz City","province":"Negros Occidental","region":"Western Visayas","lat":10.95,"lng":123.3},{"name":"Calatrava","province":"Negros Occidental","region":"Western Visayas","lat":12.617,"lng":122.067},{"name":"Candoni","province":"Negros Occidental","region":"Western Visayas","lat":9.8310444,"lng":122.6429806},{"name":"Cauayan","province":"Negros Occidental","region":"Western Visayas","lat":13.2937,"lng":123.8982},{"name":"Enrique B. Magalona (Saravia)","province":"Negros Occidental","region":"Western Visayas","lat":10.883,"lng":122.967},{"name":"Escalante","province":"Negros Occidental","region":"Western Visayas","lat":10.833,"lng":123.5},{"name":"Himamaylan","province":"Negros Occidental","region":"Western Visayas","lat":10.1,"lng":122.867},{"name":"Hinigaran","province":"Negros Occidental","region":"Western Visayas","lat":10.267,"lng":122.85},{"name":"Hinoba-An (Asia)","province":"Negros Occidental","region":"Western Visayas","lat":9.583,"lng":122.467},{"name":"Ilog","province":"Negros Occidental","region":"Western Visayas","lat":10.033,"lng":122.767},{"name":"Isabela","province":"Negros Occidental","region":"Western Visayas","lat":10.2,"lng":122.983},{"name":"Kabankalan","province":"Negros Occidental","region":"Western Visayas","lat":9.983,"lng":122.817},{"name":"La Carlota City","province":"Negros Occidental","region":"Western Visayas","lat":10.4167,"lng":122.9167},{"name":"La Castellana","province":"Negros Occidental","region":"Western Visayas","lat":10.35,"lng":123.067},{"name":"Manapla","province":"Negros Occidental","region":"Western Visayas","lat":10.95,"lng":123.12},{"name":"Moises Padilla (Magallon)","province":"Negros Occidental","region":"Western Visayas","lat":10.267,"lng":123.083},{"name":"Murcia","province":"Negros Occidental","region":"Western Visayas","lat":10.6,"lng":123.03},{"name":"Pontevedra","province":"Negros Occidental","region":"Western Visayas","lat":10.367,"lng":122.883},{"name":"Pulupandan","province":"Negros Occidental","region":"Western Visayas","lat":10.517,"lng":122.8},{"name":"Sagay City","province":"Negros Occidental","region":"Western Visayas","lat":10.9,"lng":123.417},{"name":"San Carlos City","province":"Negros Occidental","region":"Western Visayas","lat":11.6595,"lng":124.8321},{"name":"San Enrique","province":"Negros Occidental","region":"Western Visayas","lat":10.417,"lng":122.85},{"name":"Silay City","province":"Negros Occidental","region":"Western Visayas","lat":10.8,"lng":122.967},{"name":"Sipalay","province":"Negros Occidental","region":"Western Visayas","lat":9.75,"lng":122.4},{"name":"Talisay","province":"Negros Occidental","region":"Western Visayas","lat":14.133,"lng":122.917},{"name":"Toboso","province":"Negros Occidental","region":"Western Visayas","lat":10.717,"lng":123.517},{"name":"Valladolid","province":"Negros Occidental","region":"Western Visayas","lat":10.467,"lng":122.833},{"name":"Victorias","province":"Negros Occidental","region":"Western Visayas","lat":10.9,"lng":123.083},{"name":"Salvador Benedicto","province":"Negros Occidental","region":"Western Visayas","lat":10.55,"lng":123.233},{"name":"Buenavista","province":"Guimaras","region":"Western Visayas","lat":10.7,"lng":122.63},{"name":"Jordan","province":"Guimaras","region":"Western Visayas","lat":10.6,"lng":122.6},{"name":"Nueva Valencia","province":"Guimaras","region":"Western Visayas","lat":10.517,"lng":122.533},{"name":"San Lorenzo","province":"Guimaras","region":"Western Visayas","lat":10.65,"lng":122.717},{"name":"Sibunag","province":"Guimaras","region":"Western Visayas","lat":10.5,"lng":122.667},{"name":"Alburquerque","province":"Bohol","region":"Central Visayas","lat":9.6,"lng":123.95},{"name":"Alicia","province":"Bohol","region":"Central Visayas","lat":9.9,"lng":124.45},{"name":"Anda","province":"Bohol","region":"Central Visayas","lat":9.75,"lng":124.57},{"name":"Antequera","province":"Bohol","region":"Central Visayas","lat":9.78,"lng":123.9},{"name":"Baclayon","province":"Bohol","region":"Central Visayas","lat":9.63,"lng":123.9},{"name":"Balilihan","province":"Bohol","region":"Central Visayas","lat":9.75,"lng":123.97},{"name":"Batuan","province":"Bohol","region":"Central Visayas","lat":9.8,"lng":124.13},{"name":"Bilar","province":"Bohol","region":"Central Visayas","lat":9.7,"lng":124.1},{"name":"Buenavista","province":"Bohol","region":"Central Visayas","lat":10.08,"lng":124.12},{"name":"Calape","province":"Bohol","region":"Central Visayas","lat":9.88,"lng":123.88},{"name":"Candijay","province":"Bohol","region":"Central Visayas","lat":9.82,"lng":124.5},{"name":"Carmen","province":"Bohol","region":"Central Visayas","lat":9.82,"lng":124.2},{"name":"Catigbian","province":"Bohol","region":"Central Visayas","lat":9.83,"lng":124.03},{"name":"Clarin","province":"Bohol","region":"Central Visayas","lat":9.97,"lng":124.02},{"name":"Corella","province":"Bohol","region":"Central Visayas","lat":9.68,"lng":123.92},{"name":"Cortes","province":"Bohol","region":"Central Visayas","lat":9.72,"lng":123.88},{"name":"Dagohoy","province":"Bohol","region":"Central Visayas","lat":9.92,"lng":124.28},{"name":"Danao","province":"Bohol","region":"Central Visayas","lat":10.02,"lng":124.27},{"name":"Dauis","province":"Bohol","region":"Central Visayas","lat":9.62,"lng":123.85},{"name":"Dimiao","province":"Bohol","region":"Central Visayas","lat":9.62,"lng":124.17},{"name":"Duero","province":"Bohol","region":"Central Visayas","lat":9.72,"lng":124.4},{"name":"Garcia Hernandez","province":"Bohol","region":"Central Visayas","lat":9.62,"lng":124.3},{"name":"Guindulman","province":"Bohol","region":"Central Visayas","lat":9.77,"lng":124.48},{"name":"Inabanga","province":"Bohol","region":"Central Visayas","lat":10.03,"lng":124.07},{"name":"Jagna","province":"Bohol","region":"Central Visayas","lat":9.65,"lng":124.37},{"name":"Getafe","province":"Bohol","region":"Central Visayas","lat":10.15,"lng":124.15},{"name":"Lila","province":"Bohol","region":"Central Visayas","lat":9.6,"lng":124.1},{"name":"Loay","province":"Bohol","region":"Central Visayas","lat":9.6,"lng":124.02},{"name":"Loboc","province":"Bohol","region":"Central Visayas","lat":9.63,"lng":124.03},{"name":"Loon","province":"Bohol","region":"Central Visayas","lat":9.8,"lng":123.8},{"name":"Mabini","province":"Bohol","region":"Central Visayas","lat":9.87,"lng":124.52},{"name":"Maribojoc","province":"Bohol","region":"Central Visayas","lat":9.75,"lng":123.83},{"name":"Panglao","province":"Bohol","region":"Central Visayas","lat":9.58,"lng":123.75},{"name":"Pilar","province":"Bohol","region":"Central Visayas","lat":9.83,"lng":124.33},{"name":"Pres. Carlos P. Garcia (Pitogo)","province":"Bohol","region":"Central Visayas","lat":7.45,"lng":123.317},{"name":"Sagbayan (Borja)","province":"Bohol","region":"Central Visayas","lat":9.92,"lng":124.1},{"name":"San Isidro","province":"Bohol","region":"Central Visayas","lat":9.8,"lng":124.3},{"name":"San Miguel","province":"Bohol","region":"Central Visayas","lat":10.0,"lng":124.32},{"name":"Sevilla","province":"Bohol","region":"Central Visayas","lat":9.7,"lng":124.05},{"name":"Sierra Bullones","province":"Bohol","region":"Central Visayas","lat":9.82,"lng":124.28},{"name":"Sikatuna","province":"Bohol","region":"Central Visayas","lat":9.68,"lng":123.97},{"name":"Tagbilaran City","province":"Bohol","region":"Central Visayas","lat":9.65,"lng":123.85},{"name":"Talibon","province":"Bohol","region":"Central Visayas","lat":10.12,"lng":124.28},{"name":"Trinidad","province":"Bohol","region":"Central Visayas","lat":10.05,"lng":124.35},{"name":"Tubigon","province":"Bohol","region":"Central Visayas","lat":9.95,"lng":123.97},{"name":"Ubay","province":"Bohol","region":"Central Visayas","lat":10.05,"lng":124.47},{"name":"Valencia","province":"Bohol","region":"Central Visayas","lat":9.62,"lng":124.2},{"name":"Bien Unido","province":"Bohol","region":"Central Visayas","lat":10.13,"lng":124.38},{"name":"Alcantara","province":"Cebu","region":"Central Visayas","lat":12.267,"lng":122.05},{"name":"Alcoy","province":"Cebu","region":"Central Visayas","lat":9.68,"lng":123.5},{"name":"Alegria","province":"Cebu","region":"Central Visayas","lat":9.467,"lng":125.583},{"name":"Aloguinsan","province":"Cebu","region":"Central Visayas","lat":10.22,"lng":123.55},{"name":"Argao","province":"Cebu","region":"Central Visayas","lat":9.88,"lng":123.6},{"name":"Asturias","province":"Cebu","region":"Central Visayas","lat":10.57,"lng":123.72},{"name":"Badian","province":"Cebu","region":"Central Visayas","lat":9.87,"lng":123.4},{"name":"Balamban","province":"Cebu","region":"Central Visayas","lat":10.5,"lng":123.72},{"name":"Bantayan","province":"Cebu","region":"Central Visayas","lat":11.17,"lng":123.72},{"name":"Barili","province":"Cebu","region":"Central Visayas","lat":10.12,"lng":123.52},{"name":"Bogo","province":"Cebu","region":"Central Visayas","lat":11.03,"lng":124.0},{"name":"Boljoon","province":"Cebu","region":"Central Visayas","lat":9.63,"lng":123.48},{"name":"Borbon","province":"Cebu","region":"Central Visayas","lat":10.83,"lng":124.03},{"name":"Carcar","province":"Cebu","region":"Central Visayas","lat":10.1,"lng":123.63},{"name":"Carmen","province":"Cebu","region":"Central Visayas","lat":9.217,"lng":125.967},{"name":"Catmon","province":"Cebu","region":"Central Visayas","lat":14.8271,"lng":120.9915},{"name":"Cebu City","province":"Cebu","region":"Central Visayas","lat":11.1377,"lng":123.3847},{"name":"Compostela","province":"Cebu","region":"Central Visayas","lat":7.667,"lng":126.083},{"name":"Consolacion","province":"Cebu","region":"Central Visayas","lat":9.8761,"lng":126.0956},{"name":"Cordova","province":"Cebu","region":"Central Visayas","lat":10.25,"lng":123.95},{"name":"Daanbantayan","province":"Cebu","region":"Central Visayas","lat":11.25,"lng":124.0},{"name":"Dalaguete","province":"Cebu","region":"Central Visayas","lat":9.77,"lng":123.53},{"name":"Danao City","province":"Cebu","region":"Central Visayas","lat":10.52,"lng":124.03},{"name":"Dumanjug","province":"Cebu","region":"Central Visayas","lat":10.05,"lng":123.43},{"name":"Ginatilan","province":"Cebu","region":"Central Visayas","lat":9.6,"lng":123.35},{"name":"Lapu-lapu City (Opon)","province":"Cebu","region":"Central Visayas","lat":10.9645,"lng":123.4686},{"name":"Liloan","province":"Cebu","region":"Central Visayas","lat":8.0533,"lng":123.5638},{"name":"Madridejos","province":"Cebu","region":"Central Visayas","lat":11.27,"lng":123.73},{"name":"Malabuyoc","province":"Cebu","region":"Central Visayas","lat":9.65,"lng":123.33},{"name":"Mandaue City","province":"Cebu","region":"Central Visayas","lat":11.1188,"lng":123.2764},{"name":"Medellin","province":"Cebu","region":"Central Visayas","lat":11.13,"lng":123.97},{"name":"Minglanilla","province":"Cebu","region":"Central Visayas","lat":10.25,"lng":123.78},{"name":"Moalboal","province":"Cebu","region":"Central Visayas","lat":9.95,"lng":123.4},{"name":"Naga","province":"Cebu","region":"Central Visayas","lat":7.833,"lng":122.7},{"name":"Oslob","province":"Cebu","region":"Central Visayas","lat":9.55,"lng":123.4},{"name":"Pilar","province":"Cebu","region":"Central Visayas","lat":9.867,"lng":126.1},{"name":"Pinamungahan","province":"Cebu","region":"Central Visayas","lat":10.27,"lng":123.58},{"name":"Poro","province":"Cebu","region":"Central Visayas","lat":10.63,"lng":124.42},{"name":"Ronda","province":"Cebu","region":"Central Visayas","lat":10.0,"lng":123.4},{"name":"Samboan","province":"Cebu","region":"Central Visayas","lat":9.53,"lng":123.3},{"name":"San Fernando","province":"Cebu","region":"Central Visayas","lat":16.7847,"lng":121.7181},{"name":"San Francisco","province":"Cebu","region":"Central Visayas","lat":9.733,"lng":125.417},{"name":"San Remigio","province":"Cebu","region":"Central Visayas","lat":11.05,"lng":123.98},{"name":"Santa Fe","province":"Cebu","region":"Central Visayas","lat":9.3369,"lng":125.9433},{"name":"Santander","province":"Cebu","region":"Central Visayas","lat":9.45,"lng":123.33},{"name":"Sibonga","province":"Cebu","region":"Central Visayas","lat":10.03,"lng":123.57},{"name":"Sogod","province":"Cebu","region":"Central Visayas","lat":10.383,"lng":124.983},{"name":"Tabogon","province":"Cebu","region":"Central Visayas","lat":10.93,"lng":124.03},{"name":"Tabuelan","province":"Cebu","region":"Central Visayas","lat":10.82,"lng":123.87},{"name":"Talisay","province":"Cebu","region":"Central Visayas","lat":14.133,"lng":122.917},{"name":"Toledo City","province":"Cebu","region":"Central Visayas","lat":10.38,"lng":123.65},{"name":"Tuburan","province":"Cebu","region":"Central Visayas","lat":10.9667,"lng":122.4833},{"name":"Tudela","province":"Cebu","region":"Central Visayas","lat":8.25,"lng":123.833},{"name":"Amlan (Ayuquitan)","province":"Negros Oriental","region":"Central Visayas","lat":9.45,"lng":123.233},{"name":"Ayungon","province":"Negros Oriental","region":"Central Visayas","lat":9.85,"lng":123.133},{"name":"Bacong","province":"Negros Oriental","region":"Central Visayas","lat":9.25,"lng":123.283},{"name":"Bais City","province":"Negros Oriental","region":"Central Visayas","lat":9.583,"lng":123.117},{"name":"Basay","province":"Negros Oriental","region":"Central Visayas","lat":9.417,"lng":122.633},{"name":"Bayawan (Tulong)","province":"Negros Oriental","region":"Central Visayas","lat":9.367,"lng":122.8},{"name":"Bindoy (Payabon)","province":"Negros Oriental","region":"Central Visayas","lat":9.767,"lng":123.133},{"name":"Canlaon City","province":"Negros Oriental","region":"Central Visayas","lat":10.383,"lng":123.2},{"name":"Dauin","province":"Negros Oriental","region":"Central Visayas","lat":9.2,"lng":123.267},{"name":"Dumaguete City","province":"Negros Oriental","region":"Central Visayas","lat":9.317,"lng":123.3},{"name":"Guihulngan","province":"Negros Oriental","region":"Central Visayas","lat":10.117,"lng":123.267},{"name":"Jimalalud","province":"Negros Oriental","region":"Central Visayas","lat":9.983,"lng":123.2},{"name":"La Libertad","province":"Negros Oriental","region":"Central Visayas","lat":10.033,"lng":123.217},{"name":"Mabinay","province":"Negros Oriental","region":"Central Visayas","lat":9.733,"lng":122.917},{"name":"Manjuyod","province":"Negros Oriental","region":"Central Visayas","lat":9.683,"lng":123.15},{"name":"Pamplona","province":"Negros Oriental","region":"Central Visayas","lat":9.467,"lng":123.117},{"name":"San Jose","province":"Negros Oriental","region":"Central Visayas","lat":9.417,"lng":123.233},{"name":"Santa Catalina","province":"Negros Oriental","region":"Central Visayas","lat":9.333,"lng":122.867},{"name":"Siaton","province":"Negros Oriental","region":"Central Visayas","lat":9.067,"lng":123.033},{"name":"Sibulan","province":"Negros Oriental","region":"Central Visayas","lat":9.35,"lng":123.283},{"name":"Tanjay","province":"Negros Oriental","region":"Central Visayas","lat":9.517,"lng":123.1583},{"name":"Tayasan","province":"Negros Oriental","region":"Central Visayas","lat":9.917,"lng":123.15},{"name":"Valencia (Luzurriaga)","province":"Negros Oriental","region":"Central Visayas","lat":9.283,"lng":123.25},{"name":"Vallehermoso","province":"Negros Oriental","region":"Central Visayas","lat":10.333,"lng":123.317},{"name":"Zamboanguita","province":"Negros Oriental","region":"Central Visayas","lat":9.117,"lng":123.2},{"name":"Enrique Villanueva","province":"Siquijor","region":"Central Visayas","lat":9.25,"lng":123.65},{"name":"Larena","province":"Siquijor","region":"Central Visayas","lat":9.25,"lng":123.6},{"name":"Lazi","province":"Siquijor","region":"Central Visayas","lat":9.13,"lng":123.63},{"name":"Maria","province":"Siquijor","region":"Central Visayas","lat":9.2,"lng":123.65},{"name":"San Juan","province":"Siquijor","region":"Central Visayas","lat":9.17,"lng":123.5},{"name":"Siquijor","province":"Siquijor","region":"Central Visayas","lat":9.22,"lng":123.52},{"name":"Arteche","province":"Eastern Samar","region":"Eastern Visayas","lat":12.267,"lng":125.367},{"name":"Balangiga","province":"Eastern Samar","region":"Eastern Visayas","lat":11.117,"lng":125.383},{"name":"Balangkayan","province":"Eastern Samar","region":"Eastern Visayas","lat":11.467,"lng":125.5},{"name":"Borongan","province":"Eastern Samar","region":"Eastern Visayas","lat":11.6,"lng":125.43},{"name":"Can-Avid","province":"Eastern Samar","region":"Eastern Visayas","lat":12.0,"lng":125.45},{"name":"Dolores","province":"Eastern Samar","region":"Eastern Visayas","lat":12.05,"lng":125.483},{"name":"General Macarthur","province":"Eastern Samar","region":"Eastern Visayas","lat":11.25,"lng":125.533},{"name":"Giporlos","province":"Eastern Samar","region":"Eastern Visayas","lat":11.117,"lng":125.45},{"name":"Guiuan","province":"Eastern Samar","region":"Eastern Visayas","lat":11.033,"lng":125.733},{"name":"Hernani","province":"Eastern Samar","region":"Eastern Visayas","lat":11.333,"lng":125.583},{"name":"Jipapad","province":"Eastern Samar","region":"Eastern Visayas","lat":12.283,"lng":125.233},{"name":"Lawaan","province":"Eastern Samar","region":"Eastern Visayas","lat":11.15,"lng":125.3},{"name":"Llorente","province":"Eastern Samar","region":"Eastern Visayas","lat":11.417,"lng":125.533},{"name":"Maslog","province":"Eastern Samar","region":"Eastern Visayas","lat":12.1,"lng":125.167},{"name":"Maydolong","province":"Eastern Samar","region":"Eastern Visayas","lat":11.5,"lng":125.5},{"name":"Mercedes","province":"Eastern Samar","region":"Eastern Visayas","lat":11.1,"lng":125.717},{"name":"Oras","province":"Eastern Samar","region":"Eastern Visayas","lat":12.133,"lng":125.433},{"name":"Quinapondan","province":"Eastern Samar","region":"Eastern Visayas","lat":11.15,"lng":125.517},{"name":"Salcedo","province":"Eastern Samar","region":"Eastern Visayas","lat":11.15,"lng":125.667},{"name":"San Julian","province":"Eastern Samar","region":"Eastern Visayas","lat":11.75,"lng":125.45},{"name":"San Policarpo","province":"Eastern Samar","region":"Eastern Visayas","lat":12.183,"lng":125.5},{"name":"Sulat","province":"Eastern Samar","region":"Eastern Visayas","lat":11.817,"lng":125.45},{"name":"Taft","province":"Eastern Samar","region":"Eastern Visayas","lat":11.9,"lng":125.417},{"name":"Abuyog","province":"Leyte","region":"Eastern Visayas","lat":10.733,"lng":125.017},{"name":"Alangalang","province":"Leyte","region":"Eastern Visayas","lat":11.2,"lng":124.85},{"name":"Albuera","province":"Leyte","region":"Eastern Visayas","lat":10.917,"lng":124.7},{"name":"Babatngon","province":"Leyte","region":"Eastern Visayas","lat":11.417,"lng":124.85},{"name":"Barugo","province":"Leyte","region":"Eastern Visayas","lat":11.317,"lng":124.733},{"name":"Bato","province":"Leyte","region":"Eastern Visayas","lat":11.5,"lng":124.45},{"name":"Baybay","province":"Leyte","region":"Eastern Visayas","lat":10.683,"lng":124.8},{"name":"Burauen","province":"Leyte","region":"Eastern Visayas","lat":10.983,"lng":124.9},{"name":"Calubian","province":"Leyte","region":"Eastern Visayas","lat":11.45,"lng":124.417},{"name":"Capoocan","province":"Leyte","region":"Eastern Visayas","lat":11.283,"lng":124.65},{"name":"Carigara","province":"Leyte","region":"Eastern Visayas","lat":11.3,"lng":124.683},{"name":"Dagami","province":"Leyte","region":"Eastern Visayas","lat":11.06111,"lng":124.90306},{"name":"Dulag","province":"Leyte","region":"Eastern Visayas","lat":10.95,"lng":125.033},{"name":"Hilongos","province":"Leyte","region":"Eastern Visayas","lat":10.367,"lng":124.75},{"name":"Hindang","province":"Leyte","region":"Eastern Visayas","lat":10.45,"lng":124.8},{"name":"Inopacan","province":"Leyte","region":"Eastern Visayas","lat":10.5,"lng":124.75},{"name":"Isabel","province":"Leyte","region":"Eastern Visayas","lat":10.933,"lng":124.433},{"name":"Jaro","province":"Leyte","region":"Eastern Visayas","lat":11.183,"lng":124.783},{"name":"Javier (Bugho)","province":"Leyte","region":"Eastern Visayas","lat":10.8,"lng":124.933},{"name":"Julita","province":"Leyte","region":"Eastern Visayas","lat":11.4828,"lng":124.5047},{"name":"Kananga","province":"Leyte","region":"Eastern Visayas","lat":11.183,"lng":124.567},{"name":"La Paz","province":"Leyte","region":"Eastern Visayas","lat":9.5833,"lng":123.1167},{"name":"Leyte","province":"Leyte","region":"Eastern Visayas","lat":11.367,"lng":124.483},{"name":"Macarthur","province":"Leyte","region":"Eastern Visayas","lat":10.85,"lng":124.95},{"name":"Mahaplag","province":"Leyte","region":"Eastern Visayas","lat":10.583,"lng":124.983},{"name":"Matag-Ob","province":"Leyte","region":"Eastern Visayas","lat":11.117,"lng":124.467},{"name":"Matalom","province":"Leyte","region":"Eastern Visayas","lat":10.283,"lng":124.8},{"name":"Mayorga","province":"Leyte","region":"Eastern Visayas","lat":10.9,"lng":125.0},{"name":"Merida","province":"Leyte","region":"Eastern Visayas","lat":10.917,"lng":124.533},{"name":"Ormoc City","province":"Leyte","region":"Eastern Visayas","lat":11.02,"lng":124.62},{"name":"Palo","province":"Leyte","region":"Eastern Visayas","lat":11.1575,"lng":124.99083},{"name":"Palompon","province":"Leyte","region":"Eastern Visayas","lat":11.05,"lng":124.383},{"name":"Pastrana","province":"Leyte","region":"Eastern Visayas","lat":11.133,"lng":124.883},{"name":"San Isidro","province":"Leyte","region":"Eastern Visayas","lat":12.4593,"lng":123.2659},{"name":"San Miguel","province":"Leyte","region":"Eastern Visayas","lat":7.65,"lng":123.267},{"name":"Santa Fe","province":"Leyte","region":"Eastern Visayas","lat":9.3369,"lng":125.9433},{"name":"Tabango","province":"Leyte","region":"Eastern Visayas","lat":11.317,"lng":124.367},{"name":"Tabontabon","province":"Leyte","region":"Eastern Visayas","lat":11.03,"lng":124.97},{"name":"Tacloban City","province":"Leyte","region":"Eastern Visayas","lat":12.1183,"lng":123.3465},{"name":"Tanauan","province":"Leyte","region":"Eastern Visayas","lat":11.12,"lng":125.02},{"name":"Tolosa","province":"Leyte","region":"Eastern Visayas","lat":11.033,"lng":125.017},{"name":"Tunga","province":"Leyte","region":"Eastern Visayas","lat":11.25,"lng":124.75},{"name":"Villaba","province":"Leyte","region":"Eastern Visayas","lat":11.217,"lng":124.4},{"name":"Allen","province":"Northern Samar","region":"Eastern Visayas","lat":12.5,"lng":124.283},{"name":"Biri","province":"Northern Samar","region":"Eastern Visayas","lat":12.667,"lng":124.383},{"name":"Bobon","province":"Northern Samar","region":"Eastern Visayas","lat":12.517,"lng":124.567},{"name":"Capul","province":"Northern Samar","region":"Eastern Visayas","lat":12.417,"lng":124.183},{"name":"Catarman","province":"Northern Samar","region":"Eastern Visayas","lat":12.45,"lng":124.65},{"name":"Catubig","province":"Northern Samar","region":"Eastern Visayas","lat":12.4,"lng":125.05},{"name":"Gamay","province":"Northern Samar","region":"Eastern Visayas","lat":12.383,"lng":125.3},{"name":"Laoang","province":"Northern Samar","region":"Eastern Visayas","lat":12.567,"lng":125.017},{"name":"Lapinig","province":"Northern Samar","region":"Eastern Visayas","lat":12.0833,"lng":125.0167},{"name":"Las Navas","province":"Northern Samar","region":"Eastern Visayas","lat":12.3458,"lng":124.7833},{"name":"Lavezares","province":"Northern Samar","region":"Eastern Visayas","lat":12.533,"lng":124.333},{"name":"Mapanas","province":"Northern Samar","region":"Eastern Visayas","lat":12.4167,"lng":125.0},{"name":"Mondragon","province":"Northern Samar","region":"Eastern Visayas","lat":12.517,"lng":124.75},{"name":"Palapag","province":"Northern Samar","region":"Eastern Visayas","lat":12.55,"lng":124.5},{"name":"Pambujan","province":"Northern Samar","region":"Eastern Visayas","lat":12.567,"lng":124.933},{"name":"Rosario","province":"Northern Samar","region":"Eastern Visayas","lat":12.517,"lng":124.417},{"name":"San Antonio","province":"Northern Samar","region":"Eastern Visayas","lat":12.417,"lng":124.267},{"name":"San Isidro","province":"Northern Samar","region":"Eastern Visayas","lat":12.4593,"lng":123.2659},{"name":"San Jose","province":"Northern Samar","region":"Eastern Visayas","lat":13.2101,"lng":123.4706},{"name":"San Roque","province":"Northern Samar","region":"Eastern Visayas","lat":12.45,"lng":124.6333},{"name":"San Vicente","province":"Northern Samar","region":"Eastern Visayas","lat":12.35,"lng":124.05},{"name":"Silvino Lobos","province":"Northern Samar","region":"Eastern Visayas","lat":12.3,"lng":124.833},{"name":"Victoria","province":"Northern Samar","region":"Eastern Visayas","lat":12.45,"lng":124.317},{"name":"Lope De Vega","province":"Northern Samar","region":"Eastern Visayas","lat":12.3,"lng":124.617},{"name":"Almagro","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":11.917,"lng":124.283},{"name":"Basey","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":11.283,"lng":125.067},{"name":"Calbayog City","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":12.07,"lng":124.6},{"name":"Calbiga","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":11.633,"lng":125.017},{"name":"Catbalogan","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":11.783,"lng":124.883},{"name":"Daram","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":11.633,"lng":124.783},{"name":"Gandara","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":12.017,"lng":124.817},{"name":"Hinabangan","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":11.7,"lng":125.067},{"name":"Jiabong","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":11.767,"lng":124.95},{"name":"Marabut","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":11.117,"lng":125.217},{"name":"Matuguinao","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":12.15,"lng":124.883},{"name":"Motiong","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":11.783,"lng":125.0},{"name":"Pinabacdao","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":11.617,"lng":124.983},{"name":"San Jose De Buan","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":12.05,"lng":125.07},{"name":"San Sebastian","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":15.4724,"lng":120.5893},{"name":"Santa Margarita","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":12.033,"lng":124.667},{"name":"Santa Rita","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":11.467,"lng":124.95},{"name":"Santo Niño","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":6.433,"lng":124.683},{"name":"Talalora","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":11.517,"lng":124.85},{"name":"Tarangnan","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":11.9,"lng":124.75},{"name":"Villareal","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":11.567,"lng":124.933},{"name":"Paranas (Wright)","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":11.85,"lng":125.117},{"name":"Zumarraga","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":11.633,"lng":124.85},{"name":"Tagapul-An","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":12.05,"lng":124.15},{"name":"San Jorge","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":11.983,"lng":124.817},{"name":"Pagsanghan","province":"Samar (Western Samar)","region":"Eastern Visayas","lat":11.967,"lng":124.8},{"name":"Anahawan","province":"Southern Leyte","region":"Eastern Visayas","lat":10.283,"lng":125.25},{"name":"Bontoc","province":"Southern Leyte","region":"Eastern Visayas","lat":10.35,"lng":124.967},{"name":"Hinunangan","province":"Southern Leyte","region":"Eastern Visayas","lat":10.4,"lng":125.2},{"name":"Hinundayan","province":"Southern Leyte","region":"Eastern Visayas","lat":10.35,"lng":125.25},{"name":"Libagon","province":"Southern Leyte","region":"Eastern Visayas","lat":10.3,"lng":125.05},{"name":"Liloan","province":"Southern Leyte","region":"Eastern Visayas","lat":10.15,"lng":125.133},{"name":"Maasin","province":"Southern Leyte","region":"Eastern Visayas","lat":10.883,"lng":122.433},{"name":"Macrohon","province":"Southern Leyte","region":"Eastern Visayas","lat":10.083,"lng":124.95},{"name":"Malitbog","province":"Southern Leyte","region":"Eastern Visayas","lat":10.15,"lng":125.0},{"name":"Padre Burgos","province":"Southern Leyte","region":"Eastern Visayas","lat":10.033,"lng":125.017},{"name":"Pintuyan","province":"Southern Leyte","region":"Eastern Visayas","lat":9.95,"lng":125.25},{"name":"Saint Bernard","province":"Southern Leyte","region":"Eastern Visayas","lat":10.283,"lng":125.133},{"name":"San Francisco","province":"Southern Leyte","region":"Eastern Visayas","lat":10.067,"lng":125.167},{"name":"San Juan (Cabalian)","province":"Southern Leyte","region":"Eastern Visayas","lat":10.267,"lng":125.183},{"name":"San Ricardo","province":"Southern Leyte","region":"Eastern Visayas","lat":9.917,"lng":125.283},{"name":"Silago","province":"Southern Leyte","region":"Eastern Visayas","lat":10.533,"lng":125.15},{"name":"Sogod","province":"Southern Leyte","region":"Eastern Visayas","lat":10.383,"lng":124.983},{"name":"Tomas Oppus","province":"Southern Leyte","region":"Eastern Visayas","lat":10.25,"lng":124.983},{"name":"Limasawa","province":"Southern Leyte","region":"Eastern Visayas","lat":9.93333,"lng":125.07222},{"name":"Almeria","province":"Biliran","region":"Eastern Visayas","lat":11.617,"lng":124.383},{"name":"Biliran","province":"Biliran","region":"Eastern Visayas","lat":11.467,"lng":124.483},{"name":"Cabucgayan","province":"Biliran","region":"Eastern Visayas","lat":11.483,"lng":124.567},{"name":"Caibiran","province":"Biliran","region":"Eastern Visayas","lat":11.567,"lng":124.583},{"name":"Culaba","province":"Biliran","region":"Eastern Visayas","lat":11.65,"lng":124.533},{"name":"Kawayan","province":"Biliran","region":"Eastern Visayas","lat":11.683,"lng":124.367},{"name":"Maripipi","province":"Biliran","region":"Eastern Visayas","lat":11.783,"lng":124.333},{"name":"Naval","province":"Biliran","region":"Eastern Visayas","lat":11.583,"lng":124.45},{"name":"Dapitan City","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.65,"lng":123.417},{"name":"Dipolog City","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.567,"lng":123.333},{"name":"Katipunan","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.433,"lng":123.283},{"name":"La Libertad","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.45,"lng":123.5},{"name":"Labason","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.067,"lng":122.517},{"name":"Liloy","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.117,"lng":122.667},{"name":"Manukan","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.533,"lng":123.1},{"name":"Mutia","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.433,"lng":123.467},{"name":"Piñan (New Piñan)","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.4,"lng":123.433},{"name":"Polanco","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.533,"lng":123.367},{"name":"Pres. Manuel A. Roxas","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.0833,"lng":123.1333},{"name":"Rizal","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.583,"lng":123.533},{"name":"Salug","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.033,"lng":122.833},{"name":"Sergio Osmeña Sr.","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.267,"lng":123.383},{"name":"Siayan","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.133,"lng":123.1},{"name":"Sibuco","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":7.283,"lng":122.067},{"name":"Sibutad","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.6,"lng":123.467},{"name":"Sindangan","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.233,"lng":123.0},{"name":"Siocon","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":7.7,"lng":122.133},{"name":"Sirawai","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":7.583,"lng":122.133},{"name":"Tampilisan","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.017,"lng":122.683},{"name":"Jose Dalman (Ponot)","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.45,"lng":123.033},{"name":"Gutalac","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":7.983,"lng":122.4},{"name":"Baliguian","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":7.817,"lng":122.25},{"name":"Godod","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.0,"lng":122.817},{"name":"Bacungan (Leon T. Postigo)","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":8.083,"lng":122.933},{"name":"Kalawit","province":"Zamboanga del Norte","region":"Zamboanga Peninsula","lat":7.933,"lng":122.533},{"name":"Aurora","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":7.95,"lng":123.583},{"name":"Bayog","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":7.867,"lng":123.033},{"name":"Dimataling","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":7.533,"lng":123.367},{"name":"Dinas","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":7.633,"lng":123.3},{"name":"Dumalinao","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":7.817,"lng":123.367},{"name":"Dumingag","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":8.167,"lng":123.35},{"name":"Kumalarang","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":7.75,"lng":123.15},{"name":"Labangan","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":7.867,"lng":123.517},{"name":"Lapuyan","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":7.633,"lng":123.2},{"name":"Mahayag","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":8.133,"lng":123.383},{"name":"Margosatubig","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":7.583,"lng":123.167},{"name":"Midsalip","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":8.0,"lng":123.267},{"name":"Molave","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":8.083,"lng":123.483},{"name":"Pagadian City","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":7.83,"lng":123.43},{"name":"Ramon Magsaysay (Liargo)","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":8.0,"lng":123.483},{"name":"San Miguel","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":7.65,"lng":123.267},{"name":"San Pablo","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":7.65,"lng":123.45},{"name":"Tabina","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":7.467,"lng":123.417},{"name":"Tambulig","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":8.067,"lng":123.533},{"name":"Tukuran","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":7.85,"lng":123.583},{"name":"Zamboanga City","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":9.3416,"lng":122.8419},{"name":"Lakewood","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":7.85,"lng":123.167},{"name":"Josefina","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":8.2,"lng":123.533},{"name":"Pitogo","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":7.45,"lng":123.317},{"name":"Sominot (Don Mariano Marcos)","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":8.017,"lng":123.367},{"name":"Vincenzo A. Sagun","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":7.517,"lng":123.167},{"name":"Guipos","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":7.733,"lng":123.317},{"name":"Tigbao","province":"Zamboanga del Sur","region":"Zamboanga Peninsula","lat":7.817,"lng":123.283},{"name":"Alicia","province":"Zamboanga Sibugay","region":"Zamboanga Peninsula","lat":7.50833,"lng":122.94167},{"name":"Buug","province":"Zamboanga Sibugay","region":"Zamboanga Peninsula","lat":7.733,"lng":123.067},{"name":"Diplahan","province":"Zamboanga Sibugay","region":"Zamboanga Peninsula","lat":7.717,"lng":123.017},{"name":"Imelda","province":"Zamboanga Sibugay","region":"Zamboanga Peninsula","lat":7.617,"lng":122.95},{"name":"Ipil","province":"Zamboanga Sibugay","region":"Zamboanga Peninsula","lat":7.783,"lng":122.583},{"name":"Kabasalan","province":"Zamboanga Sibugay","region":"Zamboanga Peninsula","lat":7.817,"lng":122.817},{"name":"Mabuhay","province":"Zamboanga Sibugay","region":"Zamboanga Peninsula","lat":7.417,"lng":122.9},{"name":"Malangas","province":"Zamboanga Sibugay","region":"Zamboanga Peninsula","lat":7.617,"lng":123.0},{"name":"Naga","province":"Zamboanga Sibugay","region":"Zamboanga Peninsula","lat":7.833,"lng":122.7},{"name":"Olutanga","province":"Zamboanga Sibugay","region":"Zamboanga Peninsula","lat":7.333,"lng":122.833},{"name":"Payao","province":"Zamboanga Sibugay","region":"Zamboanga Peninsula","lat":7.583,"lng":122.85},{"name":"Roseller Lim","province":"Zamboanga Sibugay","region":"Zamboanga Peninsula","lat":7.7,"lng":122.467},{"name":"Siay","province":"Zamboanga Sibugay","region":"Zamboanga Peninsula","lat":7.717,"lng":122.883},{"name":"Talusan","province":"Zamboanga Sibugay","region":"Zamboanga Peninsula","lat":7.333,"lng":122.883},{"name":"Titay","province":"Zamboanga Sibugay","region":"Zamboanga Peninsula","lat":7.85,"lng":122.55},{"name":"Tungawan","province":"Zamboanga Sibugay","region":"Zamboanga Peninsula","lat":7.5,"lng":122.367},{"name":"Isabela","province":"Isabela (Province)","region":"Zamboanga Peninsula","lat":10.3629,"lng":122.5763},{"name":"Baungon","province":"Bukidnon","region":"Northern Mindanao","lat":8.25,"lng":124.717},{"name":"Damulog","province":"Bukidnon","region":"Northern Mindanao","lat":7.483,"lng":124.933},{"name":"Dangcagan","province":"Bukidnon","region":"Northern Mindanao","lat":7.617,"lng":125.0},{"name":"Don Carlos","province":"Bukidnon","region":"Northern Mindanao","lat":7.683,"lng":125.0},{"name":"Impasug-Ong","province":"Bukidnon","region":"Northern Mindanao","lat":8.3,"lng":125.0},{"name":"Kadingilan","province":"Bukidnon","region":"Northern Mindanao","lat":7.6,"lng":124.917},{"name":"Kalilangan","province":"Bukidnon","region":"Northern Mindanao","lat":7.75,"lng":124.75},{"name":"Kibawe","province":"Bukidnon","region":"Northern Mindanao","lat":7.567,"lng":124.983},{"name":"Kitaotao","province":"Bukidnon","region":"Northern Mindanao","lat":7.633,"lng":125.017},{"name":"Lantapan","province":"Bukidnon","region":"Northern Mindanao","lat":8.05,"lng":124.983},{"name":"Libona","province":"Bukidnon","region":"Northern Mindanao","lat":8.333,"lng":124.733},{"name":"Malaybalay","province":"Bukidnon","region":"Northern Mindanao","lat":8.15,"lng":125.133},{"name":"Malitbog","province":"Bukidnon","region":"Northern Mindanao","lat":8.533,"lng":124.883},{"name":"Manolo Fortich","province":"Bukidnon","region":"Northern Mindanao","lat":8.367,"lng":124.867},{"name":"Maramag","province":"Bukidnon","region":"Northern Mindanao","lat":7.767,"lng":125.0},{"name":"Pangantucan","province":"Bukidnon","region":"Northern Mindanao","lat":7.833,"lng":124.833},{"name":"Quezon","province":"Bukidnon","region":"Northern Mindanao","lat":7.733,"lng":125.1},{"name":"San Fernando","province":"Bukidnon","region":"Northern Mindanao","lat":7.917,"lng":125.333},{"name":"Sumilao","province":"Bukidnon","region":"Northern Mindanao","lat":8.283,"lng":124.95},{"name":"Talakag","province":"Bukidnon","region":"Northern Mindanao","lat":8.233,"lng":124.6},{"name":"Valencia","province":"Bukidnon","region":"Northern Mindanao","lat":9.283,"lng":123.25},{"name":"Cabanglasan","province":"Bukidnon","region":"Northern Mindanao","lat":8.067,"lng":125.317},{"name":"Catarman","province":"Camiguin","region":"Northern Mindanao","lat":9.133,"lng":124.683},{"name":"Guinsiliban","province":"Camiguin","region":"Northern Mindanao","lat":9.1,"lng":124.783},{"name":"Mahinog","province":"Camiguin","region":"Northern Mindanao","lat":9.15,"lng":124.783},{"name":"Mambajao","province":"Camiguin","region":"Northern Mindanao","lat":9.25,"lng":124.717},{"name":"Sagay","province":"Camiguin","region":"Northern Mindanao","lat":9.117,"lng":124.717},{"name":"Bacolod","province":"Lanao del Norte","region":"Northern Mindanao","lat":9.0636,"lng":125.1847},{"name":"Baloi","province":"Lanao del Norte","region":"Northern Mindanao","lat":8.117,"lng":124.217},{"name":"Baroy","province":"Lanao del Norte","region":"Northern Mindanao","lat":8.033,"lng":123.783},{"name":"Iligan City","province":"Lanao del Norte","region":"Northern Mindanao","lat":9.3037,"lng":123.643},{"name":"Kapatagan","province":"Lanao del Norte","region":"Northern Mindanao","lat":7.45,"lng":124.133},{"name":"Sultan Naga Dimaporo (Karomatan)","province":"Lanao del Norte","region":"Northern Mindanao","lat":7.783,"lng":123.75},{"name":"Kauswagan","province":"Lanao del Norte","region":"Northern Mindanao","lat":8.183,"lng":124.083},{"name":"Kolambugan","province":"Lanao del Norte","region":"Northern Mindanao","lat":8.117,"lng":123.9},{"name":"Lala","province":"Lanao del Norte","region":"Northern Mindanao","lat":7.967,"lng":123.75},{"name":"Linamon","province":"Lanao del Norte","region":"Northern Mindanao","lat":8.183,"lng":124.167},{"name":"Magsaysay","province":"Lanao del Norte","region":"Northern Mindanao","lat":10.867,"lng":121.05},{"name":"Maigo","province":"Lanao del Norte","region":"Northern Mindanao","lat":8.15,"lng":123.967},{"name":"Matungao","province":"Lanao del Norte","region":"Northern Mindanao","lat":8.133,"lng":124.167},{"name":"Munai","province":"Lanao del Norte","region":"Northern Mindanao","lat":7.983,"lng":124.067},{"name":"Nunungan","province":"Lanao del Norte","region":"Northern Mindanao","lat":7.817,"lng":123.967},{"name":"Pantao Ragat","province":"Lanao del Norte","region":"Northern Mindanao","lat":8.05,"lng":124.15},{"name":"Poona Piagapo","province":"Lanao del Norte","region":"Northern Mindanao","lat":8.083,"lng":124.083},{"name":"Salvador","province":"Lanao del Norte","region":"Northern Mindanao","lat":8.5299,"lng":123.6244},{"name":"Sapad","province":"Lanao del Norte","region":"Northern Mindanao","lat":7.85,"lng":123.833},{"name":"Tagoloan","province":"Lanao del Norte","region":"Northern Mindanao","lat":8.533,"lng":124.75},{"name":"Tangcal","province":"Lanao del Norte","region":"Northern Mindanao","lat":8.0,"lng":124.0},{"name":"Tubod","province":"Lanao del Norte","region":"Northern Mindanao","lat":9.567,"lng":125.567},{"name":"Pantar","province":"Lanao del Norte","region":"Northern Mindanao","lat":8.067,"lng":124.267},{"name":"Aloran","province":"Misamis Occidental","region":"Northern Mindanao","lat":8.417,"lng":123.817},{"name":"Baliangao","province":"Misamis Occidental","region":"Northern Mindanao","lat":8.667,"lng":123.6},{"name":"Bonifacio","province":"Misamis Occidental","region":"Northern Mindanao","lat":8.1,"lng":123.6},{"name":"Calamba","province":"Misamis Occidental","region":"Northern Mindanao","lat":8.55833,"lng":123.64167},{"name":"Clarin","province":"Misamis Occidental","region":"Northern Mindanao","lat":8.2,"lng":123.85},{"name":"Concepcion","province":"Misamis Occidental","region":"Northern Mindanao","lat":8.417,"lng":123.6},{"name":"Jimenez","province":"Misamis Occidental","region":"Northern Mindanao","lat":8.333,"lng":123.833},{"name":"Lopez Jaena","province":"Misamis Occidental","region":"Northern Mindanao","lat":8.55,"lng":123.767},{"name":"Oroquieta City","province":"Misamis Occidental","region":"Northern Mindanao","lat":8.483,"lng":123.8},{"name":"Ozamiz City","province":"Misamis Occidental","region":"Northern Mindanao","lat":8.15,"lng":123.85},{"name":"Panaon","province":"Misamis Occidental","region":"Northern Mindanao","lat":8.367,"lng":123.833},{"name":"Plaridel","province":"Misamis Occidental","region":"Northern Mindanao","lat":8.617,"lng":123.7},{"name":"Sapang Dalaga","province":"Misamis Occidental","region":"Northern Mindanao","lat":8.55,"lng":123.567},{"name":"Sinacaban","province":"Misamis Occidental","region":"Northern Mindanao","lat":8.283,"lng":123.733},{"name":"Tangub City","province":"Misamis Occidental","region":"Northern Mindanao","lat":8.067,"lng":123.75},{"name":"Tudela","province":"Misamis Occidental","region":"Northern Mindanao","lat":8.25,"lng":123.833},{"name":"Don Victoriano Chiongbian  (Don Mariano Marcos)","province":"Misamis Occidental","region":"Northern Mindanao","lat":8.3,"lng":123.583},{"name":"Alubijid","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.567,"lng":124.467},{"name":"Balingasag","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.75,"lng":124.783},{"name":"Balingoan","province":"Misamis Oriental","region":"Northern Mindanao","lat":9.0,"lng":124.85},{"name":"Binuangan","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.917,"lng":124.8},{"name":"Cagayan de Oro City","province":"Misamis Oriental","region":"Northern Mindanao","lat":11.393,"lng":123.1314},{"name":"Claveria","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.617,"lng":124.883},{"name":"El Salvador","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.567,"lng":124.517},{"name":"Gingoog City","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.817,"lng":125.1},{"name":"Gitagum","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.6,"lng":124.4},{"name":"Initao","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.5,"lng":124.317},{"name":"Jasaan","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.65,"lng":124.75},{"name":"Kinoguitan","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.983,"lng":124.817},{"name":"Lagonglong","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.8,"lng":124.783},{"name":"Laguindingan","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.583,"lng":124.45},{"name":"Libertad","province":"Misamis Oriental","region":"Northern Mindanao","lat":12.4541,"lng":122.0083},{"name":"Lugait","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.333,"lng":124.267},{"name":"Magsaysay (Linugos)","province":"Misamis Oriental","region":"Northern Mindanao","lat":10.867,"lng":121.05},{"name":"Manticao","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.383,"lng":124.283},{"name":"Medina","province":"Misamis Oriental","region":"Northern Mindanao","lat":10.9833,"lng":122.7333},{"name":"Naawan","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.433,"lng":124.3},{"name":"Opol","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.517,"lng":124.567},{"name":"Salay","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.867,"lng":124.8},{"name":"Sugbongcogon","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.95,"lng":124.783},{"name":"Tagoloan","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.533,"lng":124.75},{"name":"Talisayan","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.99167,"lng":124.88333},{"name":"Villanueva","province":"Misamis Oriental","region":"Northern Mindanao","lat":8.583,"lng":124.783},{"name":"Asuncion (Saug)","province":"Davao del Norte","region":"Davao Region","lat":7.583,"lng":125.767},{"name":"Carmen","province":"Davao del Norte","region":"Davao Region","lat":7.36056,"lng":125.70639},{"name":"Kapalong","province":"Davao del Norte","region":"Davao Region","lat":7.75,"lng":125.5},{"name":"New Corella","province":"Davao del Norte","region":"Davao Region","lat":7.583,"lng":125.833},{"name":"Panabo","province":"Davao del Norte","region":"Davao Region","lat":7.30833,"lng":125.68333},{"name":"Island Garden City Of Samal","province":"Davao del Norte","region":"Davao Region","lat":7.0833,"lng":125.7167},{"name":"Santo Tomas","province":"Davao del Norte","region":"Davao Region","lat":7.533,"lng":125.617},{"name":"Tagum","province":"Davao del Norte","region":"Davao Region","lat":7.45,"lng":125.8},{"name":"Talaingod","province":"Davao del Norte","region":"Davao Region","lat":7.617,"lng":125.617},{"name":"Braulio E. Dujali","province":"Davao del Norte","region":"Davao Region","lat":7.45,"lng":125.683},{"name":"San Isidro","province":"Davao del Norte","region":"Davao Region","lat":7.75,"lng":125.733},{"name":"Bansalan","province":"Davao del Sur","region":"Davao Region","lat":6.783,"lng":125.217},{"name":"Davao City","province":"Davao del Sur","region":"Davao Region","lat":9.8438,"lng":123.7715},{"name":"Digos","province":"Davao del Sur","region":"Davao Region","lat":6.75,"lng":125.35},{"name":"Hagonoy","province":"Davao del Sur","region":"Davao Region","lat":6.683,"lng":125.3},{"name":"Kiblawan","province":"Davao del Sur","region":"Davao Region","lat":6.617,"lng":125.217},{"name":"Magsaysay","province":"Davao del Sur","region":"Davao Region","lat":10.867,"lng":121.05},{"name":"Malalag","province":"Davao del Sur","region":"Davao Region","lat":6.6,"lng":125.4},{"name":"Matanao","province":"Davao del Sur","region":"Davao Region","lat":6.75,"lng":125.233},{"name":"Padada","province":"Davao del Sur","region":"Davao Region","lat":6.633,"lng":125.35},{"name":"Santa Cruz","province":"Davao del Sur","region":"Davao Region","lat":14.5619,"lng":121.0799},{"name":"Sulop","province":"Davao del Sur","region":"Davao Region","lat":6.6,"lng":125.35},{"name":"Baganga","province":"Davao Oriental","region":"Davao Region","lat":7.567,"lng":126.567},{"name":"Banaybanay","province":"Davao Oriental","region":"Davao Region","lat":7.1,"lng":126.067},{"name":"Boston","province":"Davao Oriental","region":"Davao Region","lat":7.867,"lng":126.367},{"name":"Caraga","province":"Davao Oriental","region":"Davao Region","lat":7.333,"lng":126.567},{"name":"Cateel","province":"Davao Oriental","region":"Davao Region","lat":7.783,"lng":126.45},{"name":"Governor Generoso","province":"Davao Oriental","region":"Davao Region","lat":6.65,"lng":126.067},{"name":"Lupon","province":"Davao Oriental","region":"Davao Region","lat":6.9,"lng":126.0},{"name":"Manay","province":"Davao Oriental","region":"Davao Region","lat":7.217,"lng":126.533},{"name":"Mati","province":"Davao Oriental","region":"Davao Region","lat":7.7098,"lng":123.2953},{"name":"San Isidro","province":"Davao Oriental","region":"Davao Region","lat":6.833,"lng":126.083},{"name":"Tarragona","province":"Davao Oriental","region":"Davao Region","lat":7.05,"lng":126.45},{"name":"Compostela","province":"Compostela Valley","region":"Davao Region","lat":7.667,"lng":126.083},{"name":"Laak (San Vicente)","province":"Compostela Valley","region":"Davao Region","lat":14.3315,"lng":121.0832},{"name":"Mabini (Doña Alicia)","province":"Compostela Valley","region":"Davao Region","lat":7.3,"lng":125.85},{"name":"Maco","province":"Compostela Valley","region":"Davao Region","lat":7.367,"lng":125.85},{"name":"Maragusan (San Mariano)","province":"Compostela Valley","region":"Davao Region","lat":16.983,"lng":122.017},{"name":"Mawab","province":"Compostela Valley","region":"Davao Region","lat":7.5,"lng":125.933},{"name":"Monkayo","province":"Compostela Valley","region":"Davao Region","lat":7.817,"lng":126.05},{"name":"Montevista","province":"Compostela Valley","region":"Davao Region","lat":7.7,"lng":125.983},{"name":"Nabunturan","province":"Compostela Valley","region":"Davao Region","lat":7.6,"lng":125.967},{"name":"New Bataan","province":"Compostela Valley","region":"Davao Region","lat":7.533,"lng":126.133},{"name":"Pantukan","province":"Compostela Valley","region":"Davao Region","lat":7.15,"lng":125.95},{"name":"Don Marcelino","province":"Davao Occidental","region":"Davao Region","lat":6.267,"lng":125.667},{"name":"Jose Abad Santos (Trinidad)","province":"Davao Occidental","region":"Davao Region","lat":10.05,"lng":124.35},{"name":"Malita","province":"Davao Occidental","region":"Davao Region","lat":6.4,"lng":125.6},{"name":"Santa Maria","province":"Davao Occidental","region":"Davao Region","lat":12.45,"lng":122.1},{"name":"Sarangani","province":"Davao Occidental","region":"Davao Region","lat":5.4,"lng":125.467},{"name":"Alamada","province":"North Cotabato","region":"SOCCSKSARGEN","lat":7.333,"lng":124.567},{"name":"Carmen","province":"North Cotabato","region":"SOCCSKSARGEN","lat":9.217,"lng":125.967},{"name":"Kabacan","province":"North Cotabato","region":"SOCCSKSARGEN","lat":7.117,"lng":124.817},{"name":"Kidapawan","province":"North Cotabato","region":"SOCCSKSARGEN","lat":7.017,"lng":125.083},{"name":"Libungan","province":"North Cotabato","region":"SOCCSKSARGEN","lat":7.25,"lng":124.517},{"name":"Magpet","province":"North Cotabato","region":"SOCCSKSARGEN","lat":7.1,"lng":125.117},{"name":"Makilala","province":"North Cotabato","region":"SOCCSKSARGEN","lat":6.967,"lng":125.083},{"name":"Matalam","province":"North Cotabato","region":"SOCCSKSARGEN","lat":7.083,"lng":124.9},{"name":"Midsayap","province":"North Cotabato","region":"SOCCSKSARGEN","lat":7.1917,"lng":124.533},{"name":"M'Lang","province":"North Cotabato","region":"SOCCSKSARGEN","lat":6.95,"lng":124.8833},{"name":"Pigkawayan","province":"North Cotabato","region":"SOCCSKSARGEN","lat":7.283,"lng":124.433},{"name":"Pikit","province":"North Cotabato","region":"SOCCSKSARGEN","lat":7.05,"lng":124.667},{"name":"President Roxas","province":"North Cotabato","region":"SOCCSKSARGEN","lat":7.15,"lng":125.05},{"name":"Tulunan","province":"North Cotabato","region":"SOCCSKSARGEN","lat":6.833,"lng":124.883},{"name":"Antipas","province":"North Cotabato","region":"SOCCSKSARGEN","lat":7.25,"lng":125.05},{"name":"Banisilan","province":"North Cotabato","region":"SOCCSKSARGEN","lat":7.5,"lng":124.7},{"name":"Aleosan","province":"North Cotabato","region":"SOCCSKSARGEN","lat":7.15,"lng":124.583},{"name":"Arakan","province":"North Cotabato","region":"SOCCSKSARGEN","lat":7.35,"lng":125.133},{"name":"Banga","province":"South Cotabato","region":"SOCCSKSARGEN","lat":10.6228,"lng":122.152},{"name":"General Santos City (Dadiangas)","province":"South Cotabato","region":"SOCCSKSARGEN","lat":8.1693,"lng":124.0739},{"name":"Koronadal","province":"South Cotabato","region":"SOCCSKSARGEN","lat":6.5,"lng":124.85},{"name":"Norala","province":"South Cotabato","region":"SOCCSKSARGEN","lat":6.55,"lng":124.667},{"name":"Polomolok","province":"South Cotabato","region":"SOCCSKSARGEN","lat":6.217,"lng":125.067},{"name":"Surallah","province":"South Cotabato","region":"SOCCSKSARGEN","lat":6.367,"lng":124.733},{"name":"Tampakan","province":"South Cotabato","region":"SOCCSKSARGEN","lat":6.45,"lng":124.933},{"name":"Tantangan","province":"South Cotabato","region":"SOCCSKSARGEN","lat":6.617,"lng":124.75},{"name":"T'Boli","province":"South Cotabato","region":"SOCCSKSARGEN","lat":6.2,"lng":124.7167},{"name":"Tupi","province":"South Cotabato","region":"SOCCSKSARGEN","lat":6.333,"lng":124.95},{"name":"Santo Niño","province":"South Cotabato","region":"SOCCSKSARGEN","lat":6.433,"lng":124.683},{"name":"Lake Sebu","province":"South Cotabato","region":"SOCCSKSARGEN","lat":6.217,"lng":124.7},{"name":"Bagumbayan","province":"Sultan Kudarat","region":"SOCCSKSARGEN","lat":6.533,"lng":124.567},{"name":"Columbio","province":"Sultan Kudarat","region":"SOCCSKSARGEN","lat":6.7,"lng":124.933},{"name":"Esperanza","province":"Sultan Kudarat","region":"SOCCSKSARGEN","lat":6.717,"lng":124.517},{"name":"Isulan","province":"Sultan Kudarat","region":"SOCCSKSARGEN","lat":6.633,"lng":124.6},{"name":"Kalamansig","province":"Sultan Kudarat","region":"SOCCSKSARGEN","lat":6.567,"lng":124.05},{"name":"Lebak","province":"Sultan Kudarat","region":"SOCCSKSARGEN","lat":6.633,"lng":124.067},{"name":"Lutayan","province":"Sultan Kudarat","region":"SOCCSKSARGEN","lat":6.6,"lng":124.85},{"name":"Lambayong (Mariano Marcos)","province":"Sultan Kudarat","region":"SOCCSKSARGEN","lat":6.8,"lng":124.633},{"name":"Palimbang","province":"Sultan Kudarat","region":"SOCCSKSARGEN","lat":6.217,"lng":124.2},{"name":"President Quirino","province":"Sultan Kudarat","region":"SOCCSKSARGEN","lat":6.7,"lng":124.733},{"name":"Tacurong","province":"Sultan Kudarat","region":"SOCCSKSARGEN","lat":6.683,"lng":124.667},{"name":"Sen. Ninoy Aquino","province":"Sultan Kudarat","region":"SOCCSKSARGEN","lat":6.4667,"lng":124.3167},{"name":"Alabel","province":"Sarangani","region":"SOCCSKSARGEN","lat":6.083,"lng":125.283},{"name":"Glan","province":"Sarangani","region":"SOCCSKSARGEN","lat":5.817,"lng":125.2},{"name":"Kiamba","province":"Sarangani","region":"SOCCSKSARGEN","lat":5.983,"lng":124.617},{"name":"Maasim","province":"Sarangani","region":"SOCCSKSARGEN","lat":5.867,"lng":125.0},{"name":"Maitum","province":"Sarangani","region":"SOCCSKSARGEN","lat":6.033,"lng":124.483},{"name":"Malapatan","province":"Sarangani","region":"SOCCSKSARGEN","lat":5.967,"lng":125.283},{"name":"Malungon","province":"Sarangani","region":"SOCCSKSARGEN","lat":6.267,"lng":125.283},{"name":"Cotabato City","province":"Cotabato City (Province)","region":"SOCCSKSARGEN","lat":9.506,"lng":123.7835},{"name":"Manila","province":"Metro Manila","region":"National Capital Region","lat":16.1381,"lng":120.7863},{"name":"Mandaluyong","province":"Metro Manila","region":"National Capital Region","lat":14.5736,"lng":121.0303},{"name":"Marikina","province":"Metro Manila","region":"National Capital Region","lat":13.3311,"lng":121.9677},{"name":"Pasig","province":"Metro Manila","region":"National Capital Region","lat":14.3361,"lng":121.2804},{"name":"Quezon City","province":"Metro Manila","region":"National Capital Region","lat":14.3697,"lng":121.5626},{"name":"San Juan","province":"Metro Manila","region":"National Capital Region","lat":14.2042,"lng":121.5334},{"name":"Caloocan City","province":"Metro Manila","region":"National Capital Region","lat":16.17,"lng":120.7802},{"name":"Malabon","province":"Metro Manila","region":"National Capital Region","lat":14.571,"lng":121.1507},{"name":"Navotas","province":"Metro Manila","region":"National Capital Region","lat":14.3238,"lng":121.2281},{"name":"Valenzuela","province":"Metro Manila","region":"National Capital Region","lat":15.5202,"lng":120.9553},{"name":"Las Piñas","province":"Metro Manila","region":"National Capital Region","lat":14.1965,"lng":121.1925},{"name":"Makati","province":"Metro Manila","region":"National Capital Region","lat":14.3471,"lng":121.2538},{"name":"Muntinlupa","province":"Metro Manila","region":"National Capital Region","lat":14.4046,"lng":121.049},{"name":"Parañaque","province":"Metro Manila","region":"National Capital Region","lat":14.0339,"lng":121.2322},{"name":"Pasay City","province":"Metro Manila","region":"National Capital Region","lat":16.17,"lng":120.7802},{"name":"Pateros","province":"Metro Manila","region":"National Capital Region","lat":14.0655,"lng":121.7681},{"name":"Taguig City","province":"Metro Manila","region":"National Capital Region","lat":15.3034,"lng":121.0067},{"name":"Bangued","province":"Abra","region":"Cordillera Administrative Region","lat":17.6,"lng":120.617},{"name":"Boliney","province":"Abra","region":"Cordillera Administrative Region","lat":17.4,"lng":120.8},{"name":"Bucay","province":"Abra","region":"Cordillera Administrative Region","lat":17.533,"lng":120.717},{"name":"Bucloc","province":"Abra","region":"Cordillera Administrative Region","lat":17.45,"lng":120.85},{"name":"Daguioman","province":"Abra","region":"Cordillera Administrative Region","lat":17.45,"lng":120.917},{"name":"Danglas","province":"Abra","region":"Cordillera Administrative Region","lat":17.7,"lng":120.65},{"name":"Dolores","province":"Abra","region":"Cordillera Administrative Region","lat":17.64667,"lng":120.71083},{"name":"La Paz","province":"Abra","region":"Cordillera Administrative Region","lat":17.70556,"lng":120.69306},{"name":"Lacub","province":"Abra","region":"Cordillera Administrative Region","lat":17.667,"lng":120.95},{"name":"Lagangilang","province":"Abra","region":"Cordillera Administrative Region","lat":17.617,"lng":120.783},{"name":"Lagayan","province":"Abra","region":"Cordillera Administrative Region","lat":17.717,"lng":120.7},{"name":"Langiden","province":"Abra","region":"Cordillera Administrative Region","lat":17.583,"lng":120.567},{"name":"Licuan-Baay (Licuan)","province":"Abra","region":"Cordillera Administrative Region","lat":10.9,"lng":122.7},{"name":"Luba","province":"Abra","region":"Cordillera Administrative Region","lat":17.34917,"lng":120.69111},{"name":"Malibcong","province":"Abra","region":"Cordillera Administrative Region","lat":17.567,"lng":120.983},{"name":"Manabo","province":"Abra","region":"Cordillera Administrative Region","lat":17.467,"lng":120.7},{"name":"Peñarrubia","province":"Abra","region":"Cordillera Administrative Region","lat":17.567,"lng":120.65},{"name":"Pidigan","province":"Abra","region":"Cordillera Administrative Region","lat":17.567,"lng":120.583},{"name":"Pilar","province":"Abra","region":"Cordillera Administrative Region","lat":17.4175,"lng":120.59417},{"name":"Sallapadan","province":"Abra","region":"Cordillera Administrative Region","lat":17.467,"lng":120.767},{"name":"San Isidro","province":"Abra","region":"Cordillera Administrative Region","lat":17.467,"lng":120.6},{"name":"San Juan","province":"Abra","region":"Cordillera Administrative Region","lat":17.717,"lng":120.75},{"name":"San Quintin","province":"Abra","region":"Cordillera Administrative Region","lat":17.54306,"lng":120.51917},{"name":"Tayum","province":"Abra","region":"Cordillera Administrative Region","lat":17.617,"lng":120.65},{"name":"Tineg","province":"Abra","region":"Cordillera Administrative Region","lat":17.767,"lng":120.933},{"name":"Tubo","province":"Abra","region":"Cordillera Administrative Region","lat":17.167,"lng":120.717},{"name":"Villaviciosa","province":"Abra","region":"Cordillera Administrative Region","lat":17.433,"lng":120.633},{"name":"Atok","province":"Benguet","region":"Cordillera Administrative Region","lat":16.58333,"lng":120.7},{"name":"Baguio City","province":"Benguet","region":"Cordillera Administrative Region","lat":15.2755,"lng":121.2066},{"name":"Bakun","province":"Benguet","region":"Cordillera Administrative Region","lat":16.7922,"lng":120.6653},{"name":"Bokod","province":"Benguet","region":"Cordillera Administrative Region","lat":16.5,"lng":120.833},{"name":"Buguias","province":"Benguet","region":"Cordillera Administrative Region","lat":16.72306,"lng":120.82806},{"name":"Itogon","province":"Benguet","region":"Cordillera Administrative Region","lat":16.367,"lng":120.683},{"name":"Kabayan","province":"Benguet","region":"Cordillera Administrative Region","lat":16.617,"lng":120.85},{"name":"Kapangan","province":"Benguet","region":"Cordillera Administrative Region","lat":16.583,"lng":120.6},{"name":"Kibungan","province":"Benguet","region":"Cordillera Administrative Region","lat":16.7,"lng":120.667},{"name":"La Trinidad","province":"Benguet","region":"Cordillera Administrative Region","lat":16.45,"lng":120.567},{"name":"Mankayan","province":"Benguet","region":"Cordillera Administrative Region","lat":16.867,"lng":120.783},{"name":"Sablan","province":"Benguet","region":"Cordillera Administrative Region","lat":16.517,"lng":120.517},{"name":"Tuba","province":"Benguet","region":"Cordillera Administrative Region","lat":16.317,"lng":120.55},{"name":"Tublay","province":"Benguet","region":"Cordillera Administrative Region","lat":16.517,"lng":120.617},{"name":"Banaue","province":"Ifugao","region":"Cordillera Administrative Region","lat":16.91889,"lng":121.05889},{"name":"Hungduan","province":"Ifugao","region":"Cordillera Administrative Region","lat":16.833,"lng":121.0},{"name":"Kiangan","province":"Ifugao","region":"Cordillera Administrative Region","lat":16.783,"lng":121.083},{"name":"Lagawe","province":"Ifugao","region":"Cordillera Administrative Region","lat":16.817,"lng":121.1},{"name":"Lamut","province":"Ifugao","region":"Cordillera Administrative Region","lat":16.65,"lng":121.225},{"name":"Mayoyao","province":"Ifugao","region":"Cordillera Administrative Region","lat":16.967,"lng":121.217},{"name":"Alfonso Lista (Potia)","province":"Ifugao","region":"Cordillera Administrative Region","lat":16.9,"lng":121.517},{"name":"Aguinaldo","province":"Ifugao","region":"Cordillera Administrative Region","lat":16.783,"lng":121.317},{"name":"Hingyon","province":"Ifugao","region":"Cordillera Administrative Region","lat":16.833,"lng":121.117},{"name":"Tinoc","province":"Ifugao","region":"Cordillera Administrative Region","lat":16.7,"lng":120.9},{"name":"Asipulo","province":"Ifugao","region":"Cordillera Administrative Region","lat":16.6,"lng":121.05},{"name":"Balbalan","province":"Kalinga","region":"Cordillera Administrative Region","lat":17.45,"lng":121.15},{"name":"Lubuagan","province":"Kalinga","region":"Cordillera Administrative Region","lat":17.35,"lng":121.183},{"name":"Pasil","province":"Kalinga","region":"Cordillera Administrative Region","lat":17.383,"lng":121.15},{"name":"Pinukpuk","province":"Kalinga","region":"Cordillera Administrative Region","lat":17.6,"lng":121.367},{"name":"Rizal (Liwan)","province":"Kalinga","region":"Cordillera Administrative Region","lat":17.5,"lng":121.6},{"name":"Tabuk","province":"Kalinga","region":"Cordillera Administrative Region","lat":17.45,"lng":121.45833},{"name":"Tanudan","province":"Kalinga","region":"Cordillera Administrative Region","lat":17.3,"lng":121.233},{"name":"Tinglayan","province":"Kalinga","region":"Cordillera Administrative Region","lat":17.283,"lng":121.167},{"name":"Barlig","province":"Mountain Province","region":"Cordillera Administrative Region","lat":17.083,"lng":121.15},{"name":"Bauko","province":"Mountain Province","region":"Cordillera Administrative Region","lat":16.983,"lng":120.867},{"name":"Besao","province":"Mountain Province","region":"Cordillera Administrative Region","lat":17.1,"lng":120.817},{"name":"Bontoc","province":"Mountain Province","region":"Cordillera Administrative Region","lat":17.08722,"lng":120.97556},{"name":"Natonin","province":"Mountain Province","region":"Cordillera Administrative Region","lat":17.1,"lng":121.283},{"name":"Paracelis","province":"Mountain Province","region":"Cordillera Administrative Region","lat":17.267,"lng":121.467},{"name":"Sabangan","province":"Mountain Province","region":"Cordillera Administrative Region","lat":16.95,"lng":120.917},{"name":"Sadanga","province":"Mountain Province","region":"Cordillera Administrative Region","lat":17.167,"lng":121.033},{"name":"Sagada","province":"Mountain Province","region":"Cordillera Administrative Region","lat":17.083,"lng":120.9},{"name":"Tadian","province":"Mountain Province","region":"Cordillera Administrative Region","lat":17.0,"lng":120.817},{"name":"Calanasan (Bayag)","province":"Apayao","region":"Cordillera Administrative Region","lat":13.0667,"lng":123.45},{"name":"Conner","province":"Apayao","region":"Cordillera Administrative Region","lat":17.8,"lng":121.333},{"name":"Flora","province":"Apayao","region":"Cordillera Administrative Region","lat":18.117,"lng":121.4},{"name":"Kabugao","province":"Apayao","region":"Cordillera Administrative Region","lat":18.017,"lng":121.183},{"name":"Luna","province":"Apayao","region":"Cordillera Administrative Region","lat":18.32583,"lng":121.35361},{"name":"Pudtol","province":"Apayao","region":"Cordillera Administrative Region","lat":18.15,"lng":121.283},{"name":"Santa Marcela","province":"Apayao","region":"Cordillera Administrative Region","lat":18.283,"lng":121.433},{"name":"Lamitan","province":"Basilan","region":"Autonomous Region in Muslim Mindanao","lat":6.65,"lng":122.133},{"name":"Lantawan","province":"Basilan","region":"Autonomous Region in Muslim Mindanao","lat":6.65,"lng":121.867},{"name":"Maluso","province":"Basilan","region":"Autonomous Region in Muslim Mindanao","lat":6.55,"lng":121.883},{"name":"Sumisip","province":"Basilan","region":"Autonomous Region in Muslim Mindanao","lat":6.417,"lng":121.983},{"name":"Tipo-Tipo","province":"Basilan","region":"Autonomous Region in Muslim Mindanao","lat":6.533,"lng":122.167},{"name":"Tuburan","province":"Basilan","region":"Autonomous Region in Muslim Mindanao","lat":6.6,"lng":122.2},{"name":"Akbar","province":"Basilan","region":"Autonomous Region in Muslim Mindanao","lat":6.65,"lng":122.217},{"name":"Al-Barka","province":"Basilan","region":"Autonomous Region in Muslim Mindanao","lat":6.467,"lng":122.183},{"name":"Hadji Mohammad Ajul","province":"Basilan","region":"Autonomous Region in Muslim Mindanao","lat":6.617,"lng":122.3},{"name":"Ungkaya Pukan","province":"Basilan","region":"Autonomous Region in Muslim Mindanao","lat":6.5,"lng":122.117},{"name":"Hadji Muhtamad","province":"Basilan","region":"Autonomous Region in Muslim Mindanao","lat":6.633,"lng":121.617},{"name":"Tabuan-Lasa","province":"Basilan","region":"Autonomous Region in Muslim Mindanao","lat":6.35,"lng":121.967},{"name":"Bacolod-Kalawi (Bacolod Grande)","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.85,"lng":124.133},{"name":"Balabagan","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.533,"lng":124.117},{"name":"Balindong (Watu)","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.917,"lng":124.2},{"name":"Bayang","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.79306,"lng":124.19194},{"name":"Binidayan","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.8,"lng":124.167},{"name":"Bubong","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":8.017,"lng":124.483},{"name":"Butig","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.717,"lng":124.3},{"name":"Ganassi","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.833,"lng":124.1},{"name":"Kapai","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":8.083,"lng":124.4},{"name":"Lumba-Bayabao (Maguing)","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.9,"lng":124.4},{"name":"Lumbatan","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.783,"lng":124.25},{"name":"Madalum","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.85,"lng":124.117},{"name":"Madamba","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.883,"lng":124.067},{"name":"Malabang","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.583,"lng":124.067},{"name":"Marantao","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.95,"lng":124.233},{"name":"Marawi City","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":8.0,"lng":124.3},{"name":"Masiu","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.817,"lng":124.317},{"name":"Mulondo","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.933,"lng":124.383},{"name":"Pagayawan (Tatarikan)","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.733,"lng":124.117},{"name":"Piagapo","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":8.0,"lng":124.2},{"name":"Poona Bayabao (Gata)","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.85,"lng":124.35},{"name":"Pualas","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.817,"lng":124.067},{"name":"Ditsaan-Ramain","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.967,"lng":124.35},{"name":"Saguiaran","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":8.033,"lng":124.267},{"name":"Tamparan","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.883,"lng":124.333},{"name":"Taraka","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.9,"lng":124.35},{"name":"Tubaran","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.717,"lng":124.167},{"name":"Tugaya","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.883,"lng":124.167},{"name":"Wao","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.683,"lng":124.683},{"name":"Marogong","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.667,"lng":124.15},{"name":"Calanogas","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.75,"lng":124.1},{"name":"Buadiposo-Buntong","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.967,"lng":124.383},{"name":"Maguing","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.9,"lng":124.4},{"name":"Picong (Sultan Gumander)","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.683,"lng":123.95},{"name":"Lumbayanague","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.783,"lng":124.283},{"name":"Bumbaran","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.8,"lng":124.65},{"name":"Tagoloan Ii","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":8.10917,"lng":124.43917},{"name":"Kapatagan","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.45,"lng":124.133},{"name":"Sultan Dumalondong","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.67778,"lng":124.26778},{"name":"Lumbaca-Unayan","province":"Lanao del Sur","region":"Autonomous Region in Muslim Mindanao","lat":7.767,"lng":124.25},{"name":"Ampatuan","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.867,"lng":124.467},{"name":"Buldon","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":7.517,"lng":124.367},{"name":"Buluan","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.86667,"lng":124.75},{"name":"Datu Paglas","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.76694,"lng":124.85},{"name":"Datu Piang","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":7.03333,"lng":124.5},{"name":"Datu Odin Sinsuat (Dinaig)","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":7.18889,"lng":124.18389},{"name":"Shariff Aguak (Maganoy)","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.86472,"lng":124.44167},{"name":"Matanog","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":7.467,"lng":124.25},{"name":"Pagalungan","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":7.057,"lng":124.701},{"name":"Parang","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":7.33333,"lng":124.31667},{"name":"Sultan Kudarat (Nuling)","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":7.233,"lng":124.25},{"name":"Sultan Sa Barongis (Lambayong)","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.8,"lng":124.633},{"name":"Kabuntalan (Tumbao)","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":7.11667,"lng":124.38333},{"name":"Upi","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":7.02889,"lng":124.165},{"name":"Talayan","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.96667,"lng":124.41667},{"name":"South Upi","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.8548444,"lng":124.1443028},{"name":"Barira","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":7.483,"lng":124.3},{"name":"Gen. S.K. Pendatun","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.9667,"lng":124.4833},{"name":"Mamasapano","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.97194,"lng":124.48111},{"name":"Talitay","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.99667,"lng":124.70528},{"name":"Pagagawan","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":7.0833,"lng":124.3167},{"name":"Paglat","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.7,"lng":124.78333},{"name":"Sultan Mastura","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":7.283,"lng":124.3},{"name":"Guindulungan","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.96583,"lng":124.34806},{"name":"Datu Saudi-Ampatuan","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.95722,"lng":124.44444},{"name":"Datu Unsay","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.92083,"lng":124.45333},{"name":"Datu Abdullah Sangki","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.751722,"lng":124.491861},{"name":"Rajah Buayan","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.91083,"lng":124.55083},{"name":"Datu Blah T. Sinsuat","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.92278,"lng":123.96833},{"name":"Datu Anggal Midtimbang","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.93333,"lng":124.33333},{"name":"Mangudadatu","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.6875,"lng":124.825},{"name":"Pandag","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.78333,"lng":124.8},{"name":"Northern Kabuntalan","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":7.13333,"lng":124.46667},{"name":"Datu Hoffer Ampatuan","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.8666694,"lng":124.45},{"name":"Datu Salibo","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":7.0166694,"lng":124.5},{"name":"Shariff Saydona Mustapha","province":"Maguindanao","region":"Autonomous Region in Muslim Mindanao","lat":6.9666694,"lng":124.5},{"name":"Indanan","province":"Sulu","region":"Autonomous Region in Muslim Mindanao","lat":6.067,"lng":121.783},{"name":"Jolo","province":"Sulu","region":"Autonomous Region in Muslim Mindanao","lat":6.05,"lng":121.0},{"name":"Kalingalan Caluang","province":"Sulu","region":"Autonomous Region in Muslim Mindanao","lat":5.883,"lng":121.267},{"name":"Luuk","province":"Sulu","region":"Autonomous Region in Muslim Mindanao","lat":6.0,"lng":121.35},{"name":"Maimbung","province":"Sulu","region":"Autonomous Region in Muslim Mindanao","lat":5.933,"lng":121.033},{"name":"Hadji Panglima Tahil (Marunggas)","province":"Sulu","region":"Autonomous Region in Muslim Mindanao","lat":6.167,"lng":120.917},{"name":"Old Panamao","province":"Sulu","region":"Autonomous Region in Muslim Mindanao","lat":5.983,"lng":121.25},{"name":"Pangutaran","province":"Sulu","region":"Autonomous Region in Muslim Mindanao","lat":6.3,"lng":120.583},{"name":"Parang","province":"Sulu","region":"Autonomous Region in Muslim Mindanao","lat":5.917,"lng":120.917},{"name":"Pata","province":"Sulu","region":"Autonomous Region in Muslim Mindanao","lat":5.833,"lng":121.083},{"name":"Patikul","province":"Sulu","region":"Autonomous Region in Muslim Mindanao","lat":6.067,"lng":121.1},{"name":"Siasi","province":"Sulu","region":"Autonomous Region in Muslim Mindanao","lat":5.55,"lng":120.817},{"name":"Talipao","province":"Sulu","region":"Autonomous Region in Muslim Mindanao","lat":5.933,"lng":121.1},{"name":"Tapul","province":"Sulu","region":"Autonomous Region in Muslim Mindanao","lat":5.717,"lng":120.9},{"name":"Tongkil","province":"Sulu","region":"Autonomous Region in Muslim Mindanao","lat":5.9833,"lng":121.05},{"name":"Panglima Estino (New Panamao)","province":"Sulu","region":"Autonomous Region in Muslim Mindanao","lat":5.967,"lng":121.2},{"name":"Lugus","province":"Sulu","region":"Autonomous Region in Muslim Mindanao","lat":5.7,"lng":120.817},{"name":"Pandami","province":"Sulu","region":"Autonomous Region in Muslim Mindanao","lat":5.533,"lng":120.75},{"name":"Omar","province":"Sulu","region":"Autonomous Region in Muslim Mindanao","lat":5.983,"lng":121.4},{"name":"Panglima Sugala (Balimbing)","province":"Tawi-tawi","region":"Autonomous Region in Muslim Mindanao","lat":5.183,"lng":120.017},{"name":"Bongao","province":"Tawi-tawi","region":"Autonomous Region in Muslim Mindanao","lat":5.033,"lng":119.767},{"name":"Mapun (Cagayan De Tawi-Tawi)","province":"Tawi-tawi","region":"Autonomous Region in Muslim Mindanao","lat":7.0,"lng":118.5},{"name":"Simunul","province":"Tawi-tawi","region":"Autonomous Region in Muslim Mindanao","lat":4.9,"lng":119.833},{"name":"Sitangkai","province":"Tawi-tawi","region":"Autonomous Region in Muslim Mindanao","lat":4.667,"lng":119.4},{"name":"South Ubian","province":"Tawi-tawi","region":"Autonomous Region in Muslim Mindanao","lat":5.183,"lng":120.483},{"name":"Tandubas","province":"Tawi-tawi","region":"Autonomous Region in Muslim Mindanao","lat":5.25,"lng":120.283},{"name":"Turtle Islands","province":"Tawi-tawi","region":"Autonomous Region in Muslim Mindanao","lat":6.083,"lng":118.317},{"name":"Languyan","province":"Tawi-tawi","region":"Autonomous Region in Muslim Mindanao","lat":5.267,"lng":120.083},{"name":"Sapa-Sapa","province":"Tawi-tawi","region":"Autonomous Region in Muslim Mindanao","lat":5.075,"lng":120.175},{"name":"Sibutu","province":"Tawi-tawi","region":"Autonomous Region in Muslim Mindanao","lat":4.683,"lng":119.467},{"name":"Buenavista","province":"Agusan del Norte","region":"Caraga","lat":13.1263,"lng":120.6918},{"name":"Butuan City","province":"Agusan del Norte","region":"Caraga","lat":10.7891,"lng":123.9179},{"name":"Cabadbaran","province":"Agusan del Norte","region":"Caraga","lat":9.117,"lng":125.533},{"name":"Carmen","province":"Agusan del Norte","region":"Caraga","lat":9.217,"lng":125.967},{"name":"Jabonga","province":"Agusan del Norte","region":"Caraga","lat":9.35,"lng":125.517},{"name":"Kitcharao","province":"Agusan del Norte","region":"Caraga","lat":9.45,"lng":125.567},{"name":"Las Nieves","province":"Agusan del Norte","region":"Caraga","lat":8.733,"lng":125.6},{"name":"Magallanes","province":"Agusan del Norte","region":"Caraga","lat":12.833,"lng":123.85},{"name":"Nasipit","province":"Agusan del Norte","region":"Caraga","lat":8.9333,"lng":125.3417},{"name":"Santiago","province":"Agusan del Norte","region":"Caraga","lat":17.3,"lng":120.45},{"name":"Tubay","province":"Agusan del Norte","region":"Caraga","lat":9.167,"lng":125.533},{"name":"Remedios T. Romualdez","province":"Agusan del Norte","region":"Caraga","lat":9.05361,"lng":125.58667},{"name":"Bayugan","province":"Agusan del Sur","region":"Caraga","lat":8.717,"lng":125.75},{"name":"Bunawan","province":"Agusan del Sur","region":"Caraga","lat":8.167,"lng":126.0},{"name":"Esperanza","province":"Agusan del Sur","region":"Caraga","lat":8.683,"lng":125.65},{"name":"La Paz","province":"Agusan del Sur","region":"Caraga","lat":8.267,"lng":125.8},{"name":"Loreto","province":"Agusan del Sur","region":"Caraga","lat":8.183,"lng":125.85},{"name":"Prosperidad","province":"Agusan del Sur","region":"Caraga","lat":8.6,"lng":125.917},{"name":"Rosario","province":"Agusan del Sur","region":"Caraga","lat":8.383,"lng":126.0},{"name":"San Francisco","province":"Agusan del Sur","region":"Caraga","lat":8.5,"lng":125.983},{"name":"San Luis","province":"Agusan del Sur","region":"Caraga","lat":8.47806,"lng":125.74389},{"name":"Santa Josefa","province":"Agusan del Sur","region":"Caraga","lat":7.983,"lng":126.033},{"name":"Talacogon","province":"Agusan del Sur","region":"Caraga","lat":8.45,"lng":125.783},{"name":"Trento","province":"Agusan del Sur","region":"Caraga","lat":8.05,"lng":126.067},{"name":"Veruela","province":"Agusan del Sur","region":"Caraga","lat":8.033,"lng":125.9},{"name":"Sibagat","province":"Agusan del Sur","region":"Caraga","lat":8.817,"lng":125.7},{"name":"Alegria","province":"Surigao del Norte","region":"Caraga","lat":9.467,"lng":125.583},{"name":"Bacuag","province":"Surigao del Norte","region":"Caraga","lat":9.6,"lng":125.633},{"name":"Burgos","province":"Surigao del Norte","region":"Caraga","lat":10.017,"lng":126.067},{"name":"Claver","province":"Surigao del Norte","region":"Caraga","lat":9.567,"lng":125.733},{"name":"Dapa","province":"Surigao del Norte","region":"Caraga","lat":9.767,"lng":126.05},{"name":"Del Carmen","province":"Surigao del Norte","region":"Caraga","lat":9.867,"lng":125.967},{"name":"General Luna","province":"Surigao del Norte","region":"Caraga","lat":9.8,"lng":126.133},{"name":"Gigaquit","province":"Surigao del Norte","region":"Caraga","lat":9.583,"lng":125.7},{"name":"Mainit","province":"Surigao del Norte","region":"Caraga","lat":9.533,"lng":125.517},{"name":"Malimono","province":"Surigao del Norte","region":"Caraga","lat":9.617,"lng":125.4},{"name":"Pilar","province":"Surigao del Norte","region":"Caraga","lat":9.867,"lng":126.1},{"name":"Placer","province":"Surigao del Norte","region":"Caraga","lat":9.65,"lng":125.6},{"name":"San Benito","province":"Surigao del Norte","region":"Caraga","lat":9.95,"lng":126.017},{"name":"San Francisco (Anao-Aon)","province":"Surigao del Norte","region":"Caraga","lat":9.733,"lng":125.417},{"name":"San Isidro","province":"Surigao del Norte","region":"Caraga","lat":9.933,"lng":126.083},{"name":"Santa Monica (Sapao)","province":"Surigao del Norte","region":"Caraga","lat":10.01944,"lng":126.03889},{"name":"Sison","province":"Surigao del Norte","region":"Caraga","lat":9.667,"lng":125.533},{"name":"Socorro","province":"Surigao del Norte","region":"Caraga","lat":9.633,"lng":125.95},{"name":"Surigao City","province":"Surigao del Norte","region":"Caraga","lat":9.78,"lng":125.48},{"name":"Tagana-An","province":"Surigao del Norte","region":"Caraga","lat":9.7,"lng":125.583},{"name":"Tubod","province":"Surigao del Norte","region":"Caraga","lat":9.567,"lng":125.567},{"name":"Barobo","province":"Surigao del Sur","region":"Caraga","lat":8.55,"lng":126.2},{"name":"Bayabas","province":"Surigao del Sur","region":"Caraga","lat":8.967,"lng":126.267},{"name":"Bislig","province":"Surigao del Sur","region":"Caraga","lat":8.183,"lng":126.35},{"name":"Cagwait","province":"Surigao del Sur","region":"Caraga","lat":8.917,"lng":126.3},{"name":"Cantilan","province":"Surigao del Sur","region":"Caraga","lat":9.333,"lng":125.983},{"name":"Carmen","province":"Surigao del Sur","region":"Caraga","lat":9.217,"lng":125.967},{"name":"Carrascal","province":"Surigao del Sur","region":"Caraga","lat":9.367,"lng":125.933},{"name":"Cortes","province":"Surigao del Sur","region":"Caraga","lat":9.233,"lng":126.167},{"name":"Hinatuan","province":"Surigao del Sur","region":"Caraga","lat":8.367,"lng":126.333},{"name":"Lanuza","province":"Surigao del Sur","region":"Caraga","lat":9.233,"lng":126.067},{"name":"Lianga","province":"Surigao del Sur","region":"Caraga","lat":8.633,"lng":126.1},{"name":"Lingig","province":"Surigao del Sur","region":"Caraga","lat":8.033,"lng":126.417},{"name":"Madrid","province":"Surigao del Sur","region":"Caraga","lat":9.267,"lng":125.967},{"name":"Marihatag","province":"Surigao del Sur","region":"Caraga","lat":8.8,"lng":126.3},{"name":"San Agustin","province":"Surigao del Sur","region":"Caraga","lat":8.733,"lng":126.133},{"name":"San Miguel","province":"Surigao del Sur","region":"Caraga","lat":8.883,"lng":126.0},{"name":"Tagbina","province":"Surigao del Sur","region":"Caraga","lat":8.45,"lng":126.167},{"name":"Tago","province":"Surigao del Sur","region":"Caraga","lat":8.967,"lng":126.15},{"name":"Tandag","province":"Surigao del Sur","region":"Caraga","lat":9.067,"lng":126.183},{"name":"Basilisa (Rizal)","province":"Dinagat Islands","region":"Caraga","lat":8.583,"lng":123.533},{"name":"Cagdianao","province":"Dinagat Islands","region":"Caraga","lat":9.917,"lng":125.667},{"name":"Dinagat","province":"Dinagat Islands","region":"Caraga","lat":9.95,"lng":125.617},{"name":"Libjo (Albor)","province":"Dinagat Islands","region":"Caraga","lat":10.2,"lng":125.567},{"name":"Loreto","province":"Dinagat Islands","region":"Caraga","lat":10.35,"lng":125.617},{"name":"San Jose","province":"Dinagat Islands","region":"Caraga","lat":13.2101,"lng":123.4706},{"name":"Tubajon","province":"Dinagat Islands","region":"Caraga","lat":10.3,"lng":125.567},{"name":"Boac","province":"Marinduque","region":"MIMAROPA Region","lat":13.45,"lng":121.833},{"name":"Buenavista","province":"Marinduque","region":"MIMAROPA Region","lat":13.25389,"lng":121.94361},{"name":"Gasan","province":"Marinduque","region":"MIMAROPA Region","lat":13.317,"lng":121.85},{"name":"Mogpog","province":"Marinduque","region":"MIMAROPA Region","lat":13.47444,"lng":121.86139},{"name":"Santa Cruz","province":"Marinduque","region":"MIMAROPA Region","lat":13.47667,"lng":122.02667},{"name":"Torrijos","province":"Marinduque","region":"MIMAROPA Region","lat":13.317,"lng":122.083},{"name":"Abra De Ilog","province":"Occidental Mindoro","region":"MIMAROPA Region","lat":13.45,"lng":120.733},{"name":"Calintaan","province":"Occidental Mindoro","region":"MIMAROPA Region","lat":12.57556,"lng":120.94278},{"name":"Looc","province":"Occidental Mindoro","region":"MIMAROPA Region","lat":13.72167,"lng":120.25056},{"name":"Lubang","province":"Occidental Mindoro","region":"MIMAROPA Region","lat":13.85778,"lng":120.12333},{"name":"Magsaysay","province":"Occidental Mindoro","region":"MIMAROPA Region","lat":12.333,"lng":121.15},{"name":"Mamburao","province":"Occidental Mindoro","region":"MIMAROPA Region","lat":13.217,"lng":120.6},{"name":"Paluan","province":"Occidental Mindoro","region":"MIMAROPA Region","lat":13.417,"lng":120.467},{"name":"Rizal","province":"Occidental Mindoro","region":"MIMAROPA Region","lat":12.467,"lng":120.967},{"name":"Sablayan","province":"Occidental Mindoro","region":"MIMAROPA Region","lat":12.817,"lng":120.767},{"name":"San Jose","province":"Occidental Mindoro","region":"MIMAROPA Region","lat":12.35,"lng":121.067},{"name":"Santa Cruz","province":"Occidental Mindoro","region":"MIMAROPA Region","lat":13.117,"lng":120.85},{"name":"Baco","province":"Oriental Mindoro","region":"MIMAROPA Region","lat":13.4125,"lng":121.12861},{"name":"Bansud","province":"Oriental Mindoro","region":"MIMAROPA Region","lat":12.833,"lng":121.367},{"name":"Bongabong","province":"Oriental Mindoro","region":"MIMAROPA Region","lat":12.717,"lng":121.367},{"name":"Bulalacao (San Pedro)","province":"Oriental Mindoro","region":"MIMAROPA Region","lat":13.2751,"lng":123.8088},{"name":"Calapan","province":"Oriental Mindoro","region":"MIMAROPA Region","lat":13.4,"lng":121.183},{"name":"Gloria","province":"Oriental Mindoro","region":"MIMAROPA Region","lat":12.917,"lng":121.467},{"name":"Mansalay","province":"Oriental Mindoro","region":"MIMAROPA Region","lat":12.517,"lng":121.433},{"name":"Naujan","province":"Oriental Mindoro","region":"MIMAROPA Region","lat":13.317,"lng":121.3},{"name":"Pinamalayan","province":"Oriental Mindoro","region":"MIMAROPA Region","lat":13.0,"lng":121.417},{"name":"Pola","province":"Oriental Mindoro","region":"MIMAROPA Region","lat":13.14389,"lng":121.44},{"name":"Puerto Galera","province":"Oriental Mindoro","region":"MIMAROPA Region","lat":13.5,"lng":120.95},{"name":"Roxas","province":"Oriental Mindoro","region":"MIMAROPA Region","lat":12.583,"lng":121.5},{"name":"San Teodoro","province":"Oriental Mindoro","region":"MIMAROPA Region","lat":13.433,"lng":121.017},{"name":"Socorro","province":"Oriental Mindoro","region":"MIMAROPA Region","lat":13.067,"lng":121.4},{"name":"Victoria","province":"Oriental Mindoro","region":"MIMAROPA Region","lat":13.367,"lng":121.2},{"name":"Aborlan","province":"Palawan","region":"MIMAROPA Region","lat":9.433,"lng":118.55},{"name":"Agutaya","province":"Palawan","region":"MIMAROPA Region","lat":11.15,"lng":120.95},{"name":"Araceli","province":"Palawan","region":"MIMAROPA Region","lat":10.333,"lng":119.6},{"name":"Balabac","province":"Palawan","region":"MIMAROPA Region","lat":7.983,"lng":117.05},{"name":"Bataraza","province":"Palawan","region":"MIMAROPA Region","lat":8.667,"lng":117.617},{"name":"Brooke'S Point","province":"Palawan","region":"MIMAROPA Region","lat":8.7833,"lng":117.8333},{"name":"Busuanga","province":"Palawan","region":"MIMAROPA Region","lat":12.167,"lng":119.95},{"name":"Cagayancillo","province":"Palawan","region":"MIMAROPA Region","lat":9.48194,"lng":121.03611},{"name":"Coron","province":"Palawan","region":"MIMAROPA Region","lat":12.0,"lng":120.2},{"name":"Cuyo","province":"Palawan","region":"MIMAROPA Region","lat":10.85,"lng":121.017},{"name":"Dumaran","province":"Palawan","region":"MIMAROPA Region","lat":10.533,"lng":119.767},{"name":"El Nido (Bacuit)","province":"Palawan","region":"MIMAROPA Region","lat":11.333,"lng":119.683},{"name":"Linapacan","province":"Palawan","region":"MIMAROPA Region","lat":11.5,"lng":119.867},{"name":"Magsaysay","province":"Palawan","region":"MIMAROPA Region","lat":10.867,"lng":121.05},{"name":"Narra","province":"Palawan","region":"MIMAROPA Region","lat":9.283,"lng":118.417},{"name":"Puerto Princesa City","province":"Palawan","region":"MIMAROPA Region","lat":11.4976,"lng":120.4556},{"name":"Quezon","province":"Palawan","region":"MIMAROPA Region","lat":16.697,"lng":121.6295},{"name":"Roxas","province":"Palawan","region":"MIMAROPA Region","lat":10.333,"lng":119.333},{"name":"San Vicente","province":"Palawan","region":"MIMAROPA Region","lat":14.3315,"lng":121.0832},{"name":"Taytay","province":"Palawan","region":"MIMAROPA Region","lat":14.567,"lng":121.133},{"name":"Kalayaan","province":"Palawan","region":"MIMAROPA Region","lat":11.05,"lng":114.283},{"name":"Culion","province":"Palawan","region":"MIMAROPA Region","lat":11.83528,"lng":119.99333},{"name":"Rizal (Marcos)","province":"Palawan","region":"MIMAROPA Region","lat":18.05,"lng":120.683},{"name":"Sofronio Española","province":"Palawan","region":"MIMAROPA Region","lat":9.05,"lng":118.033},{"name":"Alcantara","province":"Romblon","region":"MIMAROPA Region","lat":12.267,"lng":122.05},{"name":"Banton","province":"Romblon","region":"MIMAROPA Region","lat":12.95,"lng":122.08},{"name":"Cajidiocan","province":"Romblon","region":"MIMAROPA Region","lat":12.367,"lng":122.683},{"name":"Calatrava","province":"Romblon","region":"MIMAROPA Region","lat":12.617,"lng":122.067},{"name":"Concepcion","province":"Romblon","region":"MIMAROPA Region","lat":12.925,"lng":121.7083},{"name":"Corcuera","province":"Romblon","region":"MIMAROPA Region","lat":12.8,"lng":122.05},{"name":"Looc","province":"Romblon","region":"MIMAROPA Region","lat":12.267,"lng":122.0},{"name":"Magdiwang","province":"Romblon","region":"MIMAROPA Region","lat":12.483,"lng":122.517},{"name":"Odiongan","province":"Romblon","region":"MIMAROPA Region","lat":12.4,"lng":122.0},{"name":"Romblon","province":"Romblon","region":"MIMAROPA Region","lat":12.567,"lng":122.267},{"name":"San Agustin","province":"Romblon","region":"MIMAROPA Region","lat":15.9843,"lng":121.0707},{"name":"San Andres","province":"Romblon","region":"MIMAROPA Region","lat":12.517,"lng":122.017},{"name":"San Fernando","province":"Romblon","region":"MIMAROPA Region","lat":12.317,"lng":122.6},{"name":"San Jose","province":"Romblon","region":"MIMAROPA Region","lat":12.067,"lng":121.933},{"name":"Santa Fe","province":"Romblon","region":"MIMAROPA Region","lat":12.15,"lng":122.0},{"name":"Ferrol","province":"Romblon","region":"MIMAROPA Region","lat":12.333,"lng":121.95},{"name":"Santa Maria (Imelda)","province":"Romblon","region":"MIMAROPA Region","lat":7.617,"lng":122.95}];
const NORTH_CALOOCAN_REFERENCE = { lat: 14.75054, lng: 121.05406 };

const NORTH_CALOOCAN_CITY_OPTION = {
    name: "North Caloocan",
    province: "Metro Manila",
    region: "National Capital Region",
    lat: NORTH_CALOOCAN_REFERENCE.lat,
    lng: NORTH_CALOOCAN_REFERENCE.lng
};
const SOUTH_CALOOCAN_CITY_OPTION = {
    name: "South Caloocan",
    province: "Metro Manila",
    region: "National Capital Region",
    lat: 14.65,
    lng: 120.97
};

const LUZON_REGIONS = new Set([
    "Bicol Region",
    "Cagayan Valley",
    "CALABARZON",
    "Central Luzon",
    "Cordillera Administrative Region",
    "Ilocos Region",
    "MIMAROPA Region",
    "National Capital Region"
]);
const PH_LUZON_CITY_COORDINATES = PH_CITY_COORDINATES
    .filter(city => LUZON_REGIONS.has(city.region))
    .map(city => city.name === "Caloocan City" && city.province === "Metro Manila"
        ? { ...city, lat: 14.65, lng: 120.97 }
        : city)
    .concat(NORTH_CALOOCAN_CITY_OPTION, SOUTH_CALOOCAN_CITY_OPTION);

const packages = {
    simple: [
        {
            id: "simple-2",
            name: "Ruth Package (Simple Styling • 2 Panel)",
            price: 6500,
            size: "7×8ft • 2 Panel Backdrop",
            features: [
                "Venue styling with thematic backdrop",
                "Thematic balloon garland",
                "Thematic props",
                "Celebrant name styro cut",
                "Grass mat",
                "Basic lights for backdrop"
            ]
        }
    ],

    venue: [
        {
            id: "package-a",
            name: "Package A",
            price: 7900,
            size: "8×12ft • 3 Panel Backdrop",
            features: [
                "Customize backdrop",
                "Thematic balloon garland",
                "Theme character standee",
                "Thematic props",
                "Celebrant name styro cut",
                "Grass mat",
                "Basic floor lights",
                "Souvenir rack",
                "Cake pedestal",
                "Wooden bench chair",
                "Number lighted standee"
            ]
        },
        {
            id: "package-b",
            name: "Package B",
            price: 15500,
            size: "8×12ft • 3 Panel Backdrop",
            features: [
                "All Package A inclusions",
                "100pcs balloon drops",
                "10pcs cluster balloons",
                "Thematic balloon entrance arch",
                "Thematic ceiling decoration"
            ]
        }
    ],

    full: [
        {
            id: "package-c",
            name: "Package C",
            price: 19500,
            size: "8×16ft • 4 Panel Backdrop",
            features: [
                "Full venue styling",
                "Thematic ceiling",
                "Customize backdrop",
                "Thematic balloon garland",
                "Theme character standee",
                "Thematic props",
                "Celebrant name styro cut",
                "5pcs balloon table centerpiece",
                "Grass mat",
                "Basic floor lights",
                "Souvenir rack",
                "Cake pedestal",
                "Wooden bench chair",
                "Number lighted standee",
                "6 Panel of Swag",
                "200pcs balloon drops",
                "10pcs cluster balloons",
                "10pcs hanging decals",
                "Lighted entrance arch",
                "Celebrant 'Party is here!' sign"
            ]
        },
        {
            id: "package-d",
            name: "Package D",
            price: 29500,
            size: "8×20ft • 5 Panel Backdrop",
            features: [
                "Full venue styling",
                "Thematic ceiling",
                "Customize backdrop",
                "Thematic balloon garland",
                "Theme character standee",
                "Thematic props",
                "Celebrant name styro cut",
                "10pcs balloon table centerpiece",
                "Grass mat",
                "Basic floor lights",
                "Souvenir rack",
                "Cake pedestal",
                "Wooden bench chair",
                "Number lighted standee",
                "Full Panel of Swag",
                "300pcs balloon drops",
                "20pcs cluster balloons",
                "20pcs hanging decals",
                "Lighted entrance arch",
                "Celebrant 'Party is here!' sign"
            ]
        },
        {
            id: "package-e",
            name: "Package E",
            price: 35000,
            size: "8×20ft • 5 Panel Backdrop",
            features: [
                "Full venue styling",
                "Thematic ceiling",
                "Customize backdrop",
                "Thematic balloon garland",
                "Theme character standee",
                "Thematic props",
                "Celebrant name styro cut",
                "10pcs balloon table centerpiece",
                "Grass mat",
                "Basic floor lights",
                "Souvenir rack",
                "Wooden bench chair",
                "Number lighted standee",
                "Full Panel of Swag",
                "600pcs balloon drops",
                "30pcs cluster balloons",
                "20pcs hanging decals",
                "Lighted entrance arch",
                "Celebrant 'Party is here!' sign"
            ]
        }
    ]
};


// ========================================
// STATE
// ========================================

let selectedCategory = "simple";
let selectedPackage = packages.simple[0];
let selectedColor = "";
let selectedCustomColor = "#249bd3";


// ========================================
// DOM ELEMENTS
// ========================================

const categoryButtons =
    document.querySelectorAll(".category-option");

const packageOptions =
    document.getElementById("packageOptions");

const eventType =
    document.getElementById("eventType");

const inspectionAddress = document.getElementById("inspectionAddress");
const inspectionCityInput = document.getElementById("inspectionCity");
const inspectionCityOptions = document.getElementById("inspectionCityOptions");
const inspectionFeeAmount = document.getElementById("inspectionFeeAmount");
const inspectionDateInput = document.getElementById("inspectionDate");
const inspectionDatePicker = document.getElementById("inspectionDatePicker");
const inspectionDateDisplay = document.getElementById("inspectionDateDisplay");
const inspectionDatePickerWrapper = document.getElementById("inspectionDatePickerWrapper");
const inspectionCalendar = document.getElementById("inspectionCalendar");
const inspectionTimeInput = document.getElementById("inspectionTime");
const inspectionCalendarDays = document.getElementById("inspectionCalendarDays");
const inspectionCalendarMonthLabel = document.getElementById("inspectionCalendarMonth");
const inspectionCalendarHelp = document.getElementById("inspectionCalendarHelp");
const inspectionTimeHelp = document.getElementById("inspectionTimeHelp");
const inspectionCalendarPrevious = document.getElementById("inspectionCalendarPrevious");
const inspectionCalendarNext = document.getElementById("inspectionCalendarNext");
const inspectionToday = new Date();
const inspectionTodayIso = [
    inspectionToday.getFullYear(),
    String(inspectionToday.getMonth() + 1).padStart(2, "0"),
    String(inspectionToday.getDate()).padStart(2, "0")
].join("-");
const inspectionDisplayedMonth = new Date(inspectionToday.getFullYear(), inspectionToday.getMonth(), 1);
let ocularAvailabilityByDate = new Map();
let ocularAvailabilityLoaded = false;
let ocularScheduleCheckSequence = 0;

function inspectionDateToIso(year, monthIndex, day) {
    return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getInspectionSlotForTime(value) {
    const match = String(value || "").match(/^(\d{1,2}):(\d{2})/);
    if (!match) return "";
    const minutes = Number(match[1]) * 60 + Number(match[2]);
    if (minutes >= 360 && minutes < 720) return "MORNING";
    if (minutes >= 720 && minutes < 1080) return "AFTERNOON";
    if (minutes >= 1080 && minutes < 1440) return "NIGHT";
    return "";
}

function setInspectionCalendarOpen(isOpen) {
    if (!inspectionCalendar || !inspectionDatePicker) return;
    inspectionCalendar.hidden = !isOpen;
    inspectionDatePicker.setAttribute("aria-expanded", String(isOpen));
}

function updateInspectionDateDisplay() {
    if (!inspectionDateDisplay) return;
    inspectionDateDisplay.textContent = inspectionDateInput?.value
        ? new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${inspectionDateInput.value}T12:00:00Z`))
        : "Choose an inspection date";
}

inspectionDatePicker?.addEventListener("click", () => {
    const shouldOpen = Boolean(inspectionCalendar?.hidden);
    if (shouldOpen) renderInspectionCalendar();
    setInspectionCalendarOpen(shouldOpen);
});

document.addEventListener("click", event => {
    if (inspectionCalendar && !inspectionDatePickerWrapper?.contains(event.target)) {
        setInspectionCalendarOpen(false);
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && inspectionCalendar && !inspectionCalendar.hidden) {
        setInspectionCalendarOpen(false);
        inspectionDatePicker?.focus();
    }
});

function renderInspectionCalendar() {
    if (!inspectionCalendarDays || !inspectionCalendarMonthLabel) return;

    const year = inspectionDisplayedMonth.getFullYear();
    const month = inspectionDisplayedMonth.getMonth();
    inspectionCalendarMonthLabel.textContent = new Intl.DateTimeFormat("en", {
        month: "long", year: "numeric"
    }).format(inspectionDisplayedMonth);
    inspectionCalendarDays.innerHTML = "";

    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let blank = 0; blank < firstWeekday; blank++) {
        const empty = document.createElement("span");
        empty.className = "booking-calendar-day outside-month";
        empty.setAttribute("aria-hidden", "true");
        inspectionCalendarDays.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const iso = inspectionDateToIso(year, month, day);
        const date = new Date(year, month, day);
        const availability = ocularAvailabilityByDate.get(iso);
        const isFull = Boolean(availability && availability.MORNING && availability.AFTERNOON && availability.NIGHT);
        const hasTakenSlot = Boolean(availability && (availability.MORNING || availability.AFTERNOON || availability.NIGHT));
        const button = document.createElement("button");
        button.type = "button";
        button.className = "booking-calendar-day";
        button.textContent = String(day);
        button.setAttribute("role", "gridcell");
        button.setAttribute("aria-label", `${new Intl.DateTimeFormat("en", { dateStyle: "full" }).format(date)}${isFull ? ", fully booked" : hasTakenSlot ? ", some time slots taken" : ", all time slots available"}`);
        if (hasTakenSlot && !isFull) button.classList.add("partial");
        if (isFull) button.classList.add("full");
        if (inspectionDateInput?.value === iso) button.classList.add("selected");
        button.disabled = iso < inspectionTodayIso || !ocularAvailabilityLoaded || !availability || isFull;
        button.addEventListener("click", () => {
            if (button.disabled || !inspectionDateInput) return;
            inspectionDateInput.value = iso;
            updateInspectionDateDisplay();
            setInspectionCalendarOpen(false);
            if (inspectionTimeInput) inspectionTimeInput.value = "";
            renderInspectionCalendar();
            if (inspectionCalendarHelp) {
                inspectionCalendarHelp.textContent = `${new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(date)} selected. Pick a time in an open slot.`;
            }
            updateInspectionTimeAvailability();
        });
        inspectionCalendarDays.appendChild(button);
    }
}

async function updateInspectionTimeAvailability() {
    if (!inspectionTimeHelp) return;
    const checkSequence = ++ocularScheduleCheckSequence;
    const paymentBlock = document.getElementById("inspectionPaymentBlock");
    if (paymentBlock) paymentBlock.hidden = true;
    const date = inspectionDateInput?.value;
    const time = inspectionTimeInput?.value;
    if (!date) {
        inspectionTimeHelp.textContent = "Choose a date first, then select a time in an open slot.";
        return;
    }
    if (!ocularAvailabilityLoaded) {
        inspectionTimeHelp.textContent = "Date availability is still loading. Please wait and try again.";
        return;
    }
    const availability = ocularAvailabilityByDate.get(date);
    if (!availability) {
        inspectionTimeHelp.textContent = "Availability for this date could not be confirmed. Choose another date or refresh.";
        return;
    }
    const slot = getInspectionSlotForTime(time);
    if (!slot) {
        inspectionTimeHelp.textContent = "Choose a time between 6:00 AM and midnight so it falls in a morning, afternoon, or night slot.";
        return;
    }
    if (availability[slot]) {
        const label = ({ MORNING: "Morning", AFTERNOON: "Afternoon", NIGHT: "Night" })[slot];
        inspectionTimeHelp.textContent = `${label} is already booked on this date. Choose a time in another open slot.`;
        return;
    }
    const label = ({ MORNING: "Morning", AFTERNOON: "Afternoon", NIGHT: "Night" })[slot];
    const distanceKm = Number(window.kqInspectionDistanceKm);
    if (!window.kqInspectionLocation || !Number.isFinite(distanceKm)) {
        inspectionTimeHelp.textContent = `${label} appears open. Choose your city to check whether there is enough travel time from other accepted inspections.`;
        return;
    }

    inspectionTimeHelp.textContent = "Checking travel time between accepted inspections…";
    const { data: scheduleIssue, error } = await window.supabaseClient.rpc("kq_validate_ocular_inspection_schedule", {
        p_inspection_date: date,
        p_inspection_time: time,
        p_distance_from_base_km: distanceKm
    });
    if (checkSequence !== ocularScheduleCheckSequence) return;
    if (error) {
        console.error("Ocular travel availability check failed:", error);
        inspectionTimeHelp.textContent = "Travel availability could not be checked. Refresh and try again before submitting.";
        return;
    }
    inspectionTimeHelp.textContent = scheduleIssue || `${label} is open. The schedule checks the travel route, a 1-hour inspection, and a 90-minute safety buffer.`;
    if (!scheduleIssue && paymentBlock) paymentBlock.hidden = false;
}

async function loadInspectionAvailabilityForMonth() {
    if (!inspectionCalendarDays || !window.supabaseClient) {
        ocularAvailabilityLoaded = false;
        if (inspectionCalendarHelp) inspectionCalendarHelp.textContent = "Date availability is unavailable. Please refresh and try again.";
        renderInspectionCalendar();
        updateInspectionTimeAvailability();
        return;
    }

    ocularAvailabilityLoaded = false;
    if (inspectionCalendarHelp) inspectionCalendarHelp.textContent = "Loading date availability…";
    renderInspectionCalendar();

    const start = inspectionDateToIso(inspectionDisplayedMonth.getFullYear(), inspectionDisplayedMonth.getMonth(), 1);
    const end = inspectionDateToIso(
        inspectionDisplayedMonth.getFullYear(),
        inspectionDisplayedMonth.getMonth(),
        new Date(inspectionDisplayedMonth.getFullYear(), inspectionDisplayedMonth.getMonth() + 1, 0).getDate()
    );
    const { data, error } = await window.supabaseClient.rpc("kq_booking_slot_availability", {
        p_start_date: start,
        p_end_date: end
    });

    if (error) {
        console.error("Ocular date availability error:", error);
        if (inspectionCalendarHelp) inspectionCalendarHelp.textContent = "Availability setup is not active. Run booking-slot-availability.sql in Supabase, then refresh.";
        renderInspectionCalendar();
        updateInspectionTimeAvailability();
        return;
    }

    ocularAvailabilityByDate = new Map((data || []).map(row => [row.event_date, {
        MORNING: Boolean(row.morning_booked),
        AFTERNOON: Boolean(row.afternoon_booked),
        NIGHT: Boolean(row.night_booked)
    }]));
    ocularAvailabilityLoaded = true;
    renderInspectionCalendar();
    if (inspectionCalendarHelp && !inspectionDateInput?.value) {
        inspectionCalendarHelp.textContent = "Approved event bookings and accepted ocular inspections reserve one morning, afternoon, or night slot. Nearby ocular visits also need enough travel time. Orange dates still have an open slot.";
    }
    updateInspectionTimeAvailability();
}

inspectionCalendarPrevious?.addEventListener("click", () => {
    const previousMonth = new Date(inspectionDisplayedMonth.getFullYear(), inspectionDisplayedMonth.getMonth() - 1, 1);
    const currentMonth = new Date(inspectionToday.getFullYear(), inspectionToday.getMonth(), 1);
    if (previousMonth < currentMonth) return;
    inspectionDisplayedMonth.setTime(previousMonth.getTime());
    loadInspectionAvailabilityForMonth();
});
inspectionCalendarNext?.addEventListener("click", () => {
    inspectionDisplayedMonth.setMonth(inspectionDisplayedMonth.getMonth() + 1);
    loadInspectionAvailabilityForMonth();
});
inspectionTimeInput?.addEventListener("input", updateInspectionTimeAvailability);
renderInspectionCalendar();
loadInspectionAvailabilityForMonth();
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) loadInspectionAvailabilityForMonth();
});
window.setInterval(() => {
    if (!document.hidden) loadInspectionAvailabilityForMonth();
}, 30000);

function normalizeCityName(value) {
    return String(value || "")
        .toLocaleLowerCase("en-PH")
        .replace(/^(city of|municipality of)\s+/i, "")
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim();
}

function getCityLabel(city) {
    return city.province && city.province !== city.region
        ? `${city.name}, ${city.province} — ${city.region}`
        : `${city.name} — ${city.region}`;
}

function calculateCityDistanceKm(destination) {
    const radians = degrees => degrees * Math.PI / 180;
    const lat1 = radians(NORTH_CALOOCAN_REFERENCE.lat);
    const lat2 = radians(destination.lat);
    const deltaLat = radians(destination.lat - NORTH_CALOOCAN_REFERENCE.lat);
    const deltaLng = radians(destination.lng - NORTH_CALOOCAN_REFERENCE.lng);
    const value = Math.sin(deltaLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function updateInspectionFeeEstimate() {
    if (!inspectionCityInput || !inspectionFeeAmount) return;
    const help = document.getElementById('inspectionFeeHelp');
    const paymentBlock = document.getElementById('inspectionPaymentBlock');
    const query = inspectionCityInput.value.trim();
    if (!query) {
        if (help) help.textContent = '';
        if (paymentBlock) paymentBlock.hidden = true;
        inspectionFeeAmount.textContent = "Choose a Luzon city or municipality to see the inspection fee.";
        window.kqInspectionFee = null;
        window.kqInspectionDistanceKm = null;
        window.kqInspectionLocation = null;
        return;
    }

    const normalizedQuery = normalizeCityName(query);
    const exactLabelMatch = PH_LUZON_CITY_COORDINATES.find(city => normalizeCityName(getCityLabel(city)) === normalizedQuery);
    const nameMatches = PH_LUZON_CITY_COORDINATES.filter(city => normalizeCityName(city.name) === normalizedQuery);
    const destination = exactLabelMatch || (nameMatches.length === 1 ? nameMatches[0] : null);
    if (!destination) {
        if (help) help.textContent = '';
        if (paymentBlock) paymentBlock.hidden = true;
        inspectionFeeAmount.textContent = nameMatches.length > 1
            ? "More than one place has that name. Choose the suggestion with its province."
            : "Choose a city or municipality from the suggestions.";
        window.kqInspectionFee = null;
        window.kqInspectionDistanceKm = null;
        window.kqInspectionLocation = null;
        return;
    }

    const distanceKm = Math.round(calculateCityDistanceKm(destination) * 10) / 10;
    const fee = Math.ceil((1500 + (distanceKm * 20)) / 100) * 100;
    window.kqInspectionFee = fee;
    window.kqInspectionDistanceKm = distanceKm;
    window.kqInspectionLocation = {
        city: destination.name,
        province: destination.province,
        region: destination.region
    };
    inspectionFeeAmount.textContent = `📋 Inspection fee for ${getCityLabel(destination)}: ₱${fee.toLocaleString("en-PH")}`;
    if (help) help.textContent = '';
    if (paymentBlock) paymentBlock.hidden = true;
}

if (inspectionCityOptions) {
    const fragment = document.createDocumentFragment();
    PH_LUZON_CITY_COORDINATES
        .slice()
        .sort((a, b) => getCityLabel(a).localeCompare(getCityLabel(b), "en"))
        .forEach(city => {
            const option = document.createElement("option");
            option.value = getCityLabel(city);
            fragment.appendChild(option);
        });
    inspectionCityOptions.appendChild(fragment);
}
inspectionCityInput?.addEventListener("input", () => {
    updateInspectionFeeEstimate();
    updateInspectionTimeAvailability();
});

const celebrantName =
    document.getElementById("celebrantName");

const theme =
    document.getElementById("theme");

const character =
    document.getElementById("character");

const additionalRequest =
    document.getElementById("additionalRequest");

const colorButtons =
    document.querySelectorAll(".color-option");

const summaryCategory =
    document.getElementById("summaryCategory");

const summaryPackage =
    document.getElementById("summaryPackage");

const summaryPrice =
    document.getElementById("summaryPrice");

const summaryEvent =
    document.getElementById("summaryEvent");

const summaryCelebrant =
    document.getElementById("summaryCelebrant");

const summaryTheme =
    document.getElementById("summaryTheme");

const summaryColor =
    document.getElementById("summaryColor");

const summaryCharacter =
    document.getElementById("summaryCharacter");

const totalPrice =
    document.getElementById("totalPrice");

const requestQuotationBtn =
    document.getElementById("requestQuotation");

const resetCustomizer =
    document.getElementById("resetCustomizer");

const quotationModal =
    document.getElementById("quotationModal");


// ========================================
// CATEGORY NAMES
// ========================================

const categoryNames = {
    simple: "Simple Styling",
    venue: "Venue Styling",
    full: "Full Venue Styling"
};


// ========================================
// LOAD PACKAGES
// ========================================

function loadPackages() {

    if (!packageOptions) return;

    packageOptions.innerHTML = "";

    packages[selectedCategory].forEach((pkg, index) => {

        const card = document.createElement("div");

        card.className = "package-option";

        if (
            selectedPackage &&
            selectedPackage.id === pkg.id
        ) {
            card.classList.add("selected");
        }

        card.innerHTML = `
            <div class="package-option-top">

                <div>
                    <h4>${pkg.name}</h4>
                    <p>${pkg.size}</p>
                </div>

                <strong>
                    ₱${pkg.price.toLocaleString()}
                </strong>

            </div>

            <ul>
                ${pkg.features
                .map(feature => `<li>${feature}</li>`)
                .join("")}
            </ul>

            <p class="package-note">Crew meal and transportation are not included. Price may vary by venue; ocular inspection is required.</p>
        `;

        card.addEventListener("click", function () {

            selectedPackage = pkg;

            // Keep the category synchronized
            // with the selected package.
            selectedCategory =
                Object.keys(packages).find(function (category) {

                    return packages[category].some(function (item) {

                        return item.id === pkg.id;

                    });

                }) || selectedCategory;


            // Update category highlight
            categoryButtons.forEach(function (btn) {

                btn.classList.toggle(
                    "selected",
                    btn.dataset.category === selectedCategory
                );

            });


            // Reload package cards
            loadPackages();


            // Update summary
            updateSummary();

        });

        packageOptions.appendChild(card);
    });
}


// ========================================
// CATEGORY SELECTION
// ========================================

categoryButtons.forEach(button => {

    button.addEventListener("click", function () {

        selectedCategory =
            button.dataset.category;

        selectedPackage =
            packages[selectedCategory][0];

        categoryButtons.forEach(btn => {
            btn.classList.remove("selected");
        });

        button.classList.add("selected");

        loadPackages();
        updateSummary();

    });

});


// ========================================
// COLOR SELECTION
// ========================================

// ========================================
// COLOR SELECTION
// ========================================

const customColorOption =
    document.getElementById("customColorOption");

const customColorPicker =
    document.getElementById("customColorPicker");

const customColorInput =
    document.getElementById("customColorInput");

const customColorPreview =
    document.getElementById("customColorPreview");

const customColorPreviewLarge =
    document.getElementById("customColorPreviewLarge");

const customColorHex =
    document.getElementById("customColorHex");


// Preset colors
colorButtons.forEach(button => {

    button.addEventListener("click", function () {

        const color =
            button.dataset.color;

        colorButtons.forEach(btn => {
            btn.classList.remove("active");
            btn.classList.remove("selected");
        });

        button.classList.add("active");
        button.classList.add("selected");


        // CUSTOM COLOR
        if (color === "Custom") {

            selectedColor =
                selectedCustomColor;

            if (customColorPicker) {
                customColorPicker.classList.add("show");
            }

            updateCustomColorPreview();

        }

        // PRESET COLOR
        else {

            selectedColor =
                color;

            if (customColorPicker) {
                customColorPicker.classList.remove("show");
            }

        }


        updateSummary();

    });

});


// ========================================
// CUSTOM COLOR INPUT
// ========================================

if (customColorInput) {

    customColorInput.addEventListener(
        "input",
        function () {

            selectedCustomColor =
                customColorInput.value.toUpperCase();

            selectedColor =
                selectedCustomColor;

            updateCustomColorPreview();

            updateSummary();

        }
    );

}


// ========================================
// UPDATE CUSTOM COLOR PREVIEW
// ========================================

function updateCustomColorPreview() {

    if (!selectedCustomColor) return;


    if (customColorPreview) {

        customColorPreview.style.background =
            selectedCustomColor;

    }


    if (customColorPreviewLarge) {

        customColorPreviewLarge.style.background =
            selectedCustomColor;

    }


    if (customColorHex) {

        customColorHex.textContent =
            selectedCustomColor;

    }

}


// ========================================
// INPUT EVENTS
// ========================================

[
    eventType,
    celebrantName,
    theme,
    character,
    additionalRequest
].forEach(input => {

    if (!input) return;

    input.addEventListener("input", updateSummary);

});


// ========================================
// UPDATE SUMMARY
// ========================================

function updateSummary() {

    if (!selectedPackage) return;

    if (summaryCategory) {
        summaryCategory.textContent =
            categoryNames[selectedCategory];
    }

    if (summaryPackage) {
        summaryPackage.textContent =
            selectedPackage.name;
    }

    if (summaryPrice) {
        summaryPrice.textContent =
            `₱${selectedPackage.price.toLocaleString()}`;
    }

    if (totalPrice) {
        totalPrice.textContent =
            `₱${selectedPackage.price.toLocaleString()}`;
    }

    if (summaryEvent) {
        summaryEvent.textContent =
            eventType?.value || "Not specified";
    }

    if (summaryCelebrant) {
        summaryCelebrant.textContent =
            celebrantName?.value || "Not specified";
    }

    if (summaryTheme) {
        summaryTheme.textContent =
            theme?.value || "Not specified";
    }

    if (summaryColor) {
        summaryColor.textContent =
            selectedColor || "Not specified";
    }

    if (summaryCharacter) {
        summaryCharacter.textContent =
            character?.value || "Not specified";
    }
}


// ========================================
// REQUEST QUOTATION
// ========================================

async function requestQuotation() {
    const nameInput = document.getElementById("ocularName");
    const emailInput = document.getElementById("ocularEmail");
    const phoneInput = document.getElementById("ocularPhone");
    const dateInput = document.getElementById("inspectionDate");
    const timeInput = document.getElementById("inspectionTime");
    const venueNameInput = document.getElementById("venueName");
    const inspectionPaymentReferenceInput = document.getElementById("inspectionPaymentReference");

    const typedCity = inspectionCityInput?.value.trim() || "";
    const inspectionAddressValue = [inspectionAddress?.value.trim(), typedCity].filter(Boolean).join(", ");
    const preferredDate = dateInput?.value || "";
    const preferredTime = timeInput?.value || "";
    const venueName = venueNameInput?.value.trim() || "";

    if (!window.supabaseClient) {
        alert("Supabase is not connected.");
        return;
    }

    try {
        const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();
        if (userError) throw userError;
        if (!user) {
            showLoginRequiredModal();
            return;
        }

        const { data: profile, error: profileError } = await window.supabaseClient
            .from("profiles")
            .select("full_name, email, contact_number")
            .eq("id", user.id)
            .maybeSingle();
        if (profileError) console.warn("Profile lookup warning:", profileError);

        const customerName = nameInput?.value.trim() || profile?.full_name || user.user_metadata?.full_name || "";
        const customerEmail = emailInput?.value.trim() || profile?.email || user.email || "";
        const customerContact = phoneInput?.value.trim() || profile?.contact_number || user.user_metadata?.contact_number || "";

        if (!customerName || !customerEmail || !customerContact || !preferredDate || !preferredTime || !venueName || !inspectionAddressValue) {
            alert("Please complete your name, email, contact number, preferred ocular date and time, venue name, and venue address.");
            return;
        }

        const inspectionFee = Number.isFinite(window.kqInspectionFee) ? window.kqInspectionFee : null;
        const inspectionPaymentReference = inspectionPaymentReferenceInput?.value.trim() || "";
        if (!window.kqInspectionLocation || !inspectionFee) {
            alert("Choose your Luzon city or municipality from the suggestions to calculate the inspection fee.");
            return;
        }
        const inspectionDistanceKm = Number.isFinite(window.kqInspectionDistanceKm) ? window.kqInspectionDistanceKm : null;
        if (!inspectionPaymentReference) {
            alert("Pay the inspection fee shown using the QR code, then enter your payment transaction/reference number.");
            return;
        }

        const requestedSlot = getInspectionSlotForTime(preferredTime);
        if (!requestedSlot) {
            alert("Choose an ocular appointment time between 6:00 AM and midnight.");
            return;
        }

        const { data: currentAvailabilityRows, error: availabilityError } = await window.supabaseClient.rpc("kq_booking_slot_availability", {
            p_start_date: preferredDate,
            p_end_date: preferredDate
        });
        if (availabilityError) throw availabilityError;
        const currentAvailabilityRow = currentAvailabilityRows?.find(row => row.event_date === preferredDate);
        if (!currentAvailabilityRow) {
            alert("We could not confirm availability for that date. Please refresh the calendar and try again.");
            await loadInspectionAvailabilityForMonth();
            return;
        }

        const refreshedAvailability = {
            MORNING: Boolean(currentAvailabilityRow.morning_booked),
            AFTERNOON: Boolean(currentAvailabilityRow.afternoon_booked),
            NIGHT: Boolean(currentAvailabilityRow.night_booked)
        };
        ocularAvailabilityByDate.set(preferredDate, refreshedAvailability);
        ocularAvailabilityLoaded = true;
        renderInspectionCalendar();
        if (refreshedAvailability[requestedSlot]) {
            updateInspectionTimeAvailability();
            alert("That time slot has already been booked. Please choose another available time.");
            return;
        }

        const { data: scheduleIssue, error: scheduleError } = await window.supabaseClient.rpc("kq_validate_ocular_inspection_schedule", {
            p_inspection_date: preferredDate,
            p_inspection_time: preferredTime,
            p_distance_from_base_km: inspectionDistanceKm
        });
        if (scheduleError) throw scheduleError;
        if (scheduleIssue) {
            updateInspectionTimeAvailability();
            alert(scheduleIssue);
            return;
        }

        const quotationData = {
            user_id: user.id,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_contact: customerContact,
            request_purpose: "OCULAR_INSPECTION",
            inspection_date: preferredDate,
            inspection_time: preferredTime,
            inspection_address: inspectionAddressValue,
            inspection_city: window.kqInspectionLocation?.city || null,
            inspection_province: window.kqInspectionLocation?.province || null,
            inspection_region: window.kqInspectionLocation?.region || null,
            venue_name: venueName,
            inspection_fee: inspectionFee,
            inspection_distance_km: inspectionDistanceKm,
            additional_request: inspectionPaymentReference,
            status: "REQUESTED",
            admin_notes: ""
        };

        const { error } = await window.supabaseClient
            .from("ocular_inspection_requests")
            .insert([quotationData]);
        if (error) throw error;

        sessionStorage.removeItem('kqBookingDraft');
        sessionStorage.removeItem('kqSelectedPackage');

        clearOcularRequestForm();
        showQuotationModal();
    } catch (error) {
        console.error("Ocular inspection request failed:", error);
        alert(error.message || "Unable to send the ocular inspection request. Please try again.");
    }
}

// ========================================
// SUCCESS MODAL
// ========================================

function showQuotationModal() {

    if (!quotationModal) return;

    quotationModal.classList.add("show");

    quotationModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "quotation-modal-open"
    );

    closeQuotationButton?.focus();
}


// ========================================
// CLOSE MODAL
// ========================================

const closeQuotationButton = document.getElementById("closeQuotationModal");
if (closeQuotationButton) {
    closeQuotationButton.addEventListener("click", closeQuotationModal);
}


function closeQuotationModal() {

    if (!quotationModal) return;

    // Move focus out before hiding the modal from assistive technology.
    document.getElementById("requestQuotation")?.focus();

    quotationModal.classList.remove("show");

    quotationModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "quotation-modal-open"
    );
}


// ========================================
// CUSTOM MESSAGE
// ========================================

function showCustomizerMessage(
    message,
    type = "error"
) {

    let messageBox =
        document.getElementById(
            "customizerMessage"
        );


    if (!messageBox) {

        messageBox =
            document.createElement("div");

        messageBox.id =
            "customizerMessage";

        document.body.appendChild(
            messageBox
        );
    }


    messageBox.textContent =
        message;

    messageBox.className =
        `customizer-message ${type}`;

    messageBox.classList.add("show");


    setTimeout(function () {

        messageBox.classList.remove(
            "show"
        );

    }, 4000);
}


// ========================================
// RESET CUSTOMIZER
// ========================================

function clearOcularRequestForm() {
    ["ocularName", "ocularEmail", "ocularPhone", "inspectionDate", "inspectionTime", "venueName", "inspectionAddress", "inspectionCity", "inspectionPaymentReference"].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = "";
    });
    updateInspectionDateDisplay();
    setInspectionCalendarOpen(false);
    updateInspectionFeeEstimate();
    renderInspectionCalendar();
    updateInspectionTimeAvailability();
}

resetCustomizer?.addEventListener("click", clearOcularRequestForm);

(async function prefillOcularContact() {
    if (!window.supabaseClient) return;
    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) return;
        const { data: profile } = await window.supabaseClient
            .from("profiles")
            .select("full_name, email, contact_number")
            .eq("id", user.id)
            .maybeSingle();
        const values = {
            ocularName: profile?.full_name || user.user_metadata?.full_name || "",
            ocularEmail: profile?.email || user.email || "",
            ocularPhone: profile?.contact_number || user.user_metadata?.contact_number || ""
        };
        Object.entries(values).forEach(([id, value]) => {
            const field = document.getElementById(id);
            if (field && !field.value) field.value = value;
        });
    } catch (error) {
        console.warn("Ocular contact details could not be prefilled:", error);
    }
})();

// ========================================
// CLICK OUTSIDE MODAL
// ========================================

if (quotationModal) {

    quotationModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                quotationModal
            ) {
                closeQuotationModal();
            }

        }
    );

}


// ========================================
// ESC KEY
// ========================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            quotationModal?.classList.contains(
                "show"
            )
        ) {
            closeQuotationModal();
        }

    }
);


// ========================================
// INITIALIZE
// ========================================

loadPackages();
updateSummary();

console.log(
    "KQ Event Styling Customizer loaded."
);

// ========================================
// REQUEST QUOTATION BUTTON
// ========================================

if (requestQuotationBtn) {
    requestQuotationBtn.addEventListener(
        "click",
        requestQuotation
    );
}
function showLoginRequiredModal() {
    const modal = document.getElementById("loginRequiredModal");

    if (!modal) return;

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeLoginRequiredModal() {
    const modal = document.getElementById("loginRequiredModal");

    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

const notNowBtn = document.getElementById("notNowBtn");
const loginRequiredBtn = document.getElementById("loginRequiredBtn");

if (notNowBtn) {
    notNowBtn.addEventListener("click", closeLoginRequiredModal);
}

if (loginRequiredBtn) {
    loginRequiredBtn.addEventListener("click", function () {
        window.location.href = "login.html";
    });
}
