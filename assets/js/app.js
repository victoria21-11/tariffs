const Tariff = {
    data: function () {
        return {
            tariffs: {},
        }
    },
    mounted() {
        this.getData();
    },
    methods: {
        getData() {
        	this.tariffs = this.sendRequest('/api/tariffs');
        	this.setPriceRange();
        },
        setPriceRange() {
        	this.tariffs.tarifs.forEach((item) => {
        		item.lowest_price = this.getPrice(item.tarifs);
        		item.highest_price = this.getPrice(item.tarifs, min = false);
        	});
        },
        getPrice(tarifs, min = true) {
			tarifs.sort((a, b) => {
				if (min) return b.price - a.price;
			  	return a.price - b.price;
			});
			let result = tarifs[0];
			return result.price / result.pay_period;
        },
        getColor(item) {
            if (item.title.toLowerCase().includes('вода')) {
                return '#1b75d9';
            } else if (item.title.toLowerCase().includes('огонь')) {
                return '#e74807';
            } else if (item.title.toLowerCase().includes('земля')) {
                return '#70603e';
            }
        }
    },
    template: `
		<div>
			<div class="row">
				<div class="col-12 col-md-6 col-lg-4 mb-20" v-for="item in tariffs.tarifs">
					<div class="tariffs__item">
				        <div class="traiffs__title">
				            Тариф "{{ item.title }}"
				        </div>
				        <div class="tariffs__body tariffs__link">
				            <router-link :to="{ name: \'tariffShow\', params: { name: item.title } }" tag="div">
                                <div class="tariffs__speed" :style="{ 'background-color': getColor(item) }">
                                    {{ item.speed }} Мбит/с
                                </div>
                                <div>
                                    {{ item.lowest_price }} - {{ item.highest_price }} &#8381;/мес
                                </div>
                                <div class="tariffs__extra">
                                    <div v-for="option in item.free_options">
                                        {{ option }}
                                    </div>
                                </div>
				            </router-link>
				        </div>
				        <div class="tariffs__footer">
				        	<a :href="item.link">Узнать подробнее на сайте www.sknt.ru</a>
				        </div>
				    </div>
				</div>
			</div>
		    
		</div>
    `
}
const TariffShow = {
    data() {
        return {
            name: this.$route.params.name,
            tariff: null,
            oneMonthPrice: 0
        }
    },
    mounted() {
        this.getData();
    },
    methods: {
        getOneMonthPrice() {
            let result = this.tariff.tarifs.find(item => item.pay_period == 1);
            this.oneMonthPrice = result.price;
        },
        getData() {
        	this.tariff = this.sendRequest('/api/tariffs/info?name=' + this.name);
            this.getOneMonthPrice();
        },
        getDiscount(item) {
            let priceWithoutDiscount = this.oneMonthPrice * item.pay_period;
            return priceWithoutDiscount - item.price;
        },


    },
    template: `
		<div class="" v-if="tariff">
            <router-link :to="{ name: 'tariffs' }" tag="div" class="tariffs__back">
                Тариф "{{ tariff.title }}"
            </router-link>
            <div class="row">
                <div class="col-12 col-md-6 col-lg-4 mb-20" v-for="item in tariff.tarifs">
                    <div class="tariffs__item">
                        <div class="traiffs__title">
                            {{ item.pay_period }}
                            месяц
                        </div>
                        <div class="tariffs__body tariffs__link">
                            <router-link :to="{ name: \'tariffSelection\', params: { name: tariff.title, id: item.ID } }" tag="div">
                                <span class="font-weight-bold">
                                    {{ getSinglePayment(item) }}
                                    &#8381;/мес
                                </span>
                                <div class="tariffs__extra">
                                    <div>pазовый платеж - {{ item.price }} &#8381;</div>
                                    <div v-if="getDiscount(item)">скидка - {{ getDiscount(item) }} &#8381;</div>
                                </div>
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
		            
		</div>
    `
}

const TariffSelection = {
	data() {
		return {
			tariff: null,
			version: null,
			selected: false,
		}
	},
	mounted() {
		this.getData();
	},
	methods: {
		getData() {
			let data = this.sendRequest('/api/tariffs/info/versions/' + this.$route.params.id + '?name=' + this.$route.params.name);
			this.tariff = data.tariff;
			this.version = data.version;
		},
		getActiveAt() {
            let timestamp = this.version.new_payday.split('+');
            let date = new Date(timestamp[0] * 1000);
			let endDate = new Date(date.setMonth(date.getMonth() + parseInt(this.version.pay_period)));
            return this.getFormattedDate(endDate);
		},
        getFormattedDate(date) {
            return this.getFullNumber(date.getDate()) + '.' + this.getFullNumber(date.getMonth() + 1) + '.' + date.getFullYear();
        },
        getFullNumber(number) {
            if (number.toString().length == 1) return '0' + number;
            return number;
        },
        selectedTariff() {
        	this.selected = true;
        }
	},
	template: `
		<div v-if="tariff">
			<router-link :to="{ name: 'tariffShow', params: { name: tariff.title } }" tag="div" class="tariffs__back">
			    Выбор тарифа
			</router-link>
            <div class="row">
                <div class="col-12 col-md-6 col-lg-4 mb-20">
                    <div class="tariffs__item">
                        <div class="traiffs__title">
                            Тариф "{{ tariff.title }}"
                        </div>
                        <div class="tariffs__body">
                            <div>
                                Период оплаты - {{ version.pay_period }} месяц
                                <div>
                                    {{ getSinglePayment(version) }}
                                    &#8381;/мес
                                </div>
                            </div>
                            
                            <div class="tariffs__extra">
                                <div>разовый платеж - {{ version.price }} &#8381;</div>
                                <div>со счета спишется - {{ version.price }} &#8381;</div>
                            </div>
                            
                            <div class="tariffs__extra text-muted">
                                <div>вступит в силу - сегодня</div>
                                <div>активно до - {{ getActiveAt() }}</div>
                            </div>
                        </div>
                        <div class="tariffs__footer">
                            <button class="tariffs__button" :disabled="selected" @click="selectedTariff">
                                <template v-if="selected">
                                    Выбран
                                </template>
                                <template v-else>
                                    Выбрать
                                </template>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
		        
		</div>
	`
}

const routes = [
    {
        path: '/',
        name: 'tariffs',
        component: Tariff
    },
    {
        path: '/tariffs/:name',
        name: 'tariffShow',
        component: TariffShow
    },
    {
        path: '/tariffs/:name/versions/:id',
        name: 'tariffSelection',
        component: TariffSelection
    },
]

const router = new VueRouter({
    routes
})

Vue.mixin({
  	methods: {
	    sendRequest(url) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, false);
			xhr.send();

			if (xhr.status == 200) {
				return JSON.parse(xhr.responseText);
			} else {
			  
			}
		},
        getSinglePayment(item) {
            return item.price / item.pay_period;
        }
  	}
})

const app = new Vue({
    router,
    methods: {
    	
    }
}).$mount('#app')