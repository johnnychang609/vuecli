<template>
  <div id="app">
    <!--<HelloWorld msg="Welcome to Your Vue.js App"/>-->


  <div class="cotainer" >
      <div class="row justify-content-center">
        <div class="col-md-10">
            
          <div class="card">
            <div class="card-header">Vue cli lesson</div>
            <div class="card-body">
              <a-alert :message="messagers" type="success" v-show="display" />
              <div class="input-group mb-3" >
                <div class="input-group-prepend">
                  <label class="input-group-text" for="inputGroupSelect01">Product ID</label>
                </div>
                <a-select @change="handleChange" v-model="Pid"  style="width: 200px" >
                  <a-select-option v-for="item in tableData" :key='item.product_id' :disabled="(item.vip && vip===false) || (item.stock_pcs===0)">
                    {{item.product_id}}
                  </a-select-option>
                </a-select>

                <div class="input-group-prepend">
                  <label class="input-group-text" for="inputGroupSelect01">數量</label>
                </div>
                <input type="number" v-model="pcs" value=0 class="form-control" placeholder="輸入數量"  min="1" :max="maxcount" aria-label="qty" aria-describedby="basic-addon1" :disabled="Pid===null">    

                <div class="input-group-prepend">
                  <span class="input-group-text" id="basic-addon1">客戶ID</span>
                </div>
                <input type="text" v-model="clientid" class="form-control" placeholder="請輸入客戶ID" aria-label="Username" aria-describedby="basic-addon1">  

                <div class="input-group-prepend">
                  <span class="input-group-text" id="basic-addon1">VIP</span>
                </div>
                <div class="form-control" style="float:left">
                  <input style="width:30px;height:25px" v-model="vip"  type="checkbox" value="" checked >
                </div>

                <button class="btn btn-primary" @click="handsubmit()" :disabled="Pid===null || clientid ===null || pcs===0">新增訂單</button>    

              </div>                
                
                <v-client-table ref="myTable" :data="tableData" :columns="columns" :options="options">
                    <template slot="stock_pcs" slot-scope="{ row }">
                      <span v-if="row.stock_pcs>0" v-text="row.stock_pcs"></span>
                      <span v-if="row.stock_pcs===0" style="color:red">貨源不足</span>
                    </template>  
                  <input slot="vip" slot-scope="{ row }" type="checkbox" :checked="row.vip" v-model="row.vip" @change="checkbox($event.srcElement.checked,row)" :value="row.product_id" >
                </v-client-table>  

                <v-client-table ref="myorder" :data="orderData" :columns="mcolumns" :options="moptions">
                    <template slot="product_id" slot-scope="{ row }">
                      <span>{{ row.product_id.product_id }}</span>
                    </template> 
                    <template slot="price" slot-scope="{ row }">
                      <span>{{ row.product_id.price }}</span>
                    </template>  
                    <template slot="shop_id" slot-scope="{ row }">
                      <span>{{ row.product_id.shop_id }}</span>
                    </template> 
                    <template slot="delete" slot-scope="{ row }">
                      <a-icon type="delete" @click="mremoves(row.order_id,row.product_id.product_id,row.qty)"></a-icon>
                    </template>
                    
                </v-client-table>                  

            </div> 
            <div class="card-footer">
                  <a-button type="dashed" @click="gettop()" block>TOP 3</a-button>
                <div class="col d-flex justify-content-center">
                  <ol class="c" style="width:150px">
                    <li v-for="item in tops" :key='item.product_id'>
                      訂單 : {{item.product_id}} 
                      數量 : {{item.qty}} 
                    </li>
                  </ol>
                </div>                  
            </div>
          </div>

        </div>
      </div>
  </div>



  </div>
</template>
<script src="https://cdnjs.cloudflare.com/ajax/libs/linq.js/2.2.0.2/linq.min.js"></script>
<script>
//import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    //HelloWorld
  },
  data() {
      return {
        columns: [ "product_id", "stock_pcs","price","shop_id","vip"],
        tableData: [],
        orderData :[],
        checkedRows:[], 
        clientid:null,
        tops:{},
        vip:false,
        pcs:1,
        Pid:null,
        display:false,
        maxcount:1,
        messagers:null,
        options: {
          headings: {
            product_id :"Product ID",
            stock_pcs : "Stock pcs",
            price : "Price",
            shop_id: "Shop ID",
            vip: "VIP",
              }
        },
        mcolumns: ["order_id",'product_id','qty','price','shop_id',"customer_id","delete"],
        moptions: {
                sortable: [],
                headings: {  
                        order_id:"Order ID",
                        product_id: "Product ID",
                        qty: "QTY",
                        price: "Price",
                        shop_id: "Shop ID",
                        customer_id: "Customer ID",
                        delete:"刪除"
                    },
                    uniqueKey: 'order_id',
                    preserveState: false,
            },  




      };
    },
  methods: {
    handleChange(){
      this.pcs=1
      let obj = this.tableData.filter((el)=> { return el.product_id === this.Pid});
      this.maxcount=obj[0].stock_pcs
    },
    async handsubmit(){
          this.messagers = null
          this.display = false
          let rs=await this.axios.post('/api/v1/order/Cvip/',{vip:this.vip,pcs:this.pcs,Pid:this.Pid}) .then((response) => {return response.data})
          if(rs.pcstate){
            await this.axios.post('/api/v1/order/putorder/',{customer_id:this.clientid,qty:this.pcs,product_id:this.Pid})
            .then((response) => {return response.data})
            .finally(() => {
              this.clientid=null
              this.pcs=1
              this.readdata()
            })
          }
    },
    async checkbox(e,obj){
          let pid=obj.product_id  
          await this.axios.put('/api/v1/product/'+pid+'/',{vip:e}) .then((response) => {return response.data}) 
          this.tableData = this.tableData.map(x=> { 
                              if(pid===x.product_id){
                                x.vip = e
                              }
                              return x;
                              } );            
    },

    
            mremoves(orderid,Pid,qty){
              let self = this
              this.$confirm({
                title: '您想要刪除該筆資料嗎?',
                content: '',
                async onOk() {
                  self.dlitem(orderid,Pid,qty) 
                  return new Promise((resolve, reject) => {
                    setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
                  }).catch(() => console.log('Oops errors!'));

                },
                onCancel() {},
              });

            },      
            
           async dlitem(orderid,Pid,qty){
              await this.axios.post('/api/v1/order/delorder/',{orderid:orderid,qty:qty,Pid:Pid})
              this.readdata()
              this.messagers ="商品到貨"
              this.display = true
            },

    async readdata(){
          await this.axios.get('/api/v1/product/')
          .then(response => (this.tableData = response.data.objects));
          await this.axios.get('/api/v1/order/')
          .then(response => (this.orderData = response.data.objects));
          
    },

    gettop(){
          let datas=[];
          for(let obj of this.orderData){
            datas.push({id:obj.product_id.product_id,qty:obj.qty})
          }
          //console.log(datas)
          let sumsArray = {}
          datas.forEach(item => {
            let sums = sumsArray[item.id]
            if (sums) {
              sums.qty += item.qty
              //sums.valore += item.qty * item.price
            } else {
              sumsArray[item.id] = {
                product_id: item.id,
                qty: item.qty,
                //valore: item.qty * item.price
              }
            }
          })
          this.tops = sumsArray
    }
  },
  computed:{

  },
  created(){
      this.readdata()
    },    
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
ol.c {
  list-style-type: upper-roman;
}
</style>
