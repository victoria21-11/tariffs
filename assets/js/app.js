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
            axios.get('/api/tariffs')
            .then(response => {
                this.tariffs = response.data;
                this.selectedTarif = _.head(this.tariffs.tarifs);
            })
        },
        getHighestPrice(tarifs) {
            let result = _.last(tarifs);
            return this.checkPriceResult(result);
        },
        getLowestPrice(tarifs) {
            let result = _.head(tarifs);
            return this.checkPriceResult(result);
        },
        checkPriceResult(result) {
            if (result) {
                result = result.price;
            }
            return result;
        },
        
    },
    template: `
		<div class="tariffs__container">
			<div class="row">
				<div class="col-12 col-md-6 col-lg-4" v-for="item in tariffs.tarifs">
					<div class="card rounded-0 mb-3 border-left-0 border-right-0">
				        <div class="card-header bg-white">
				            Тариф "{{ item.title }}"
				        </div>
				        <div class="card-body">
				            <router-link :to="{ name: \'tariffShow\', params: { name: item.title } }" tag="div" class="d-flex align-items-center pointer">
				                <div class="w-100">
				                    <span class="badge badge-primary rounded-0 tariffs__speed">
				    						{{ item.speed }} Мбит/с
				    					</span>
				                    <div>
				                        {{ getLowestPrice(item.tarifs) }} - {{ getHighestPrice(item.tarifs) }} &#8381;/мес
				                    </div>
				                </div>
				                <div>
				                    <i class="fas fa-chevron-right"></i></div>
				            </router-link>
				        </div>
				        <div class="card-footer bg-white">
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
            tariff: null
        }
    },
    mounted() {
    	console.log(this.name)
        this.getData();
    },
    methods: {
        getData() {
            axios.get('/api/tariffs/info', {
                params: {
                    name: this.name
                }
            })
            .then(response => {
                this.tariff = response.data;
            })
        },
        getSinglePayment(item) {
            return item.pay_period * item.price;
        }
    },
    template: `
		<div class="" v-if="tariff">
		    <div class="card border-0">
		    	<router-link :to="{ name: 'tariffs' }" tag="div" class="pointer card-header tariffs__title text-center font-weight-bold">
		        	<i class="fas fa-chevron-left float-left"></i>
		        	Тариф "{{ tariff.title }}"
		        </router-link>
		        <div class="card-body pt-4 bg-light px-0 tariffs__container">
		        	<div class="row">
		        		<div class="col-12 col-md-6 col-lg-4" v-for="item in tariff.tarifs">
		        			<div class="card mb-3">
				                <div class="card-header bg-white font-weight-bold">
				                	{{ item.pay_period }}
				                	месяц
				                </div>
				                <div class="card-body">
				                    <router-link :to="{ name: \'tariffSelection\', params: { name: tariff.title, id: item.ID } }" tag="div" class="pointer d-flex align-items-center">
				                        <div class="w-100">
				                        	<span class="tariffs__price-per-month">
				                        		{{ item.price }}
				                        		&#8381;/мес
				                        	</span>
				                            <div class="text-muted">
				                            	pазовый платеж - {{ getSinglePayment(item) }} &#8381;
				                            </div>
				                        </div>
				                        <div>
				                        	<i class="fas fa-chevron-right"></i>
				                        </div>
				                    </router-link>
				                </div>
				            </div>
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
			axios.get('/api/tariffs/info/versions/' + this.$route.params.id, {
                params: {
                    name: this.$route.params.name
                }
            })
            .then(response => {
            	this.tariff = response.data.tariff;
            	this.version = response.data.version;
            })
		},
		getActiveAt() {
			return moment().add(this.version.pay_period, 'months').format('DD.MM.YYYY');
		},
		getSinglePayment() {
            return this.version.pay_period * this.version.price;
        },
        selectedTariff() {
        	this.selected = true;
        }
	},
	template: `
		<div class="card border-0" v-if="tariff">
			<router-link :to="{ name: 'tariffShow', params: { name: tariff.title } }" tag="div" class="pointer card-header text-center tariffs__title font-weight-bold">
			    <i class="fas fa-chevron-left float-left"></i>
			    Выбор тарифа
			</router-link>
		    <div class="card-body pt-4 bg-light px-0 tariffs__container">
		    	<div class="row">
	        		<div class="col-12 col-md-6 col-lg-4">
	        			<div class="card">
				            <div class="card-header font-weight-bold">
				            	Тариф "{{ tariff.title }}"
				            </div>
				            <div class="card-body lh-normal">
				            	<div class="font-weight-bold">
				            		Период оплаты - {{ version.pay_period }} месяцев
					                <div>
					                	{{ version.price }}
					                	&#8381;/мес
					                </div>
				            	</div>
				            	
				            	<div class="my-2">
									<div>разовый платеж -{{ getSinglePayment() }}&#8381;</div>
				                	<div>со счета спишется -{{ getSinglePayment() }}&#8381;</div>
				            	</div>
				                
				                <div class="text-muted">
				                    <div>вступит в силу - сегодня</div>
				                    <div>активно до - {{ getActiveAt() }}</div>
				                </div>
				            </div>
				            <div class="card-footer">
				                <button class="btn btn-success btn-block" :disabled="selected" @click="selectedTariff">
				                	<template v-if="selected">
				                		<i class="fas fa-check-circle"></i>
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

const app = new Vue({
    router,
    
    methods: {

    }
}).$mount('#app')