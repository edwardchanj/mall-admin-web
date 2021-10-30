<template> 
  <div class="app-container">
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>1. Termination / Suspension of Season Parking for Staff</span>
    </el-card>

    <el-form  :model="user" :rules="rules" ref="controlForm" label-position="left" label-width="300px" size="small" style="margin: 10px">
        <el-form-item label="User ID" prop="email">
            <el-input v-model="user.email" style="width: 250px"></el-input>
            <el-button type="primary" size="small" @click="handleRetrieve(user.email)">Retrieve</el-button>
        </el-form-item>
        <el-form-item label="Site Id" prop="siteId">
          <v-select 
            label="name"
            :options="$store.state.parking.pkSite.list"
            :value="$store.state.parking.pkSite.id"
            @input="setSelected"
          ></v-select>

        </el-form-item>
        <el-form-item label="Name" prop="name">
            <el-input v-model="user.name" style="width: 250px" disabled></el-input>
        </el-form-item>
        <el-form-item label="User Code" prop="usercode">
            <el-input v-model="user.phone" style="width: 250px" disabled></el-input>
        </el-form-item>
  
    </el-form>

    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>Please select type of termination/suspension</span>
    </el-card>

    <el-form :model="season" :rules="rules" ref="season3Form" label-position="left" label-width="300px" size="small" style="margin: 10px">
        <el-form-item label="Season: " prop="seasonType">
            <template>
              <el-radio v-model="season.seasonType" label=1>Monthly Season</el-radio>
              <el-radio v-model="season.seasonType" label=2>Daily Season</el-radio>
            </template>
        </el-form-item>
        <el-form-item label="Date from" prop="startDatetime">
            <el-date-picker
              v-model="season.startDatetime"
              type="date"
              placeholder="Pick a day"
              :picker-options="pickerOptions">
            </el-date-picker>
        </el-form-item>
        <el-form-item label="Date to (not required for termination)" prop="endDateTime">
            <el-date-picker
              v-model="season.endDateTime"
              type="date"
              placeholder="Pick a day"
              :picker-options="pickerOptions">
            </el-date-picker>
        </el-form-item>
        <el-form-item label="Reason" prop="reason">
            <el-input v-model="user.reason" style="width: 250px" disabled></el-input>
        </el-form-item>
        <el-form-item label="Name" prop="name">
            <el-input v-model="user.username" style="width: 250px" disabled></el-input>
        </el-form-item>
        <el-form-item label="Residental address for posting of cheque" prop="name">
            <el-input v-model="user.name" style="width: 250px" disabled></el-input>
        </el-form-item>

    </el-form>

    <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false" size="small">取 消</el-button>
    <el-button type="primary" @click="onSubmit('seasonForm')" size="small">Approve</el-button>
    </span>




  </div>
</template>
<script>


  import {mapGetters } from 'vuex'
  import {getInfo, fetchList,createAdmin,updateAdmin,updateUser,updateStatus,deleteAdmin,getRoleByAdmin,getCurrent,getEmail,allocRole} from '@/api/login';
  import {listSite, saveSeason, getSeasonBySiteUser} from '@/api/parking';
  import 'vue-select/dist/vue-select.css';
  import {fetchAllRoleList} from '@/api/role';
  import {formatDate} from '@/utils/date';

  const fetchSelection = (search, loading) => {
      
       
        listSite(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          console.log(this.list)
          this.total = response.data.total;
        });
  }

  const checkSelection = (rule, value, callback) => {
    if (!value) {
      return callback(new Error('不能为空'));
    }
    console.log("checkSelection",value);
    let intValue = parseInt(value);
    if (!Number.isInteger(intValue)) {
      return callback(new Error('请输入数字值'));
    }
    if(intValue > 10){
      return callback(new Error('Out of Range'));
    }
    callback();
  };

  const checkNumber = (rule, value, callback) => {
    if (!value) {
      return callback(new Error('不能为空'));
    }
    console.log("checkSelection",value);
    let intValue = parseInt(value);
    if (!Number.isInteger(intValue)) {
      return callback(new Error('请输入数字值'));
    }
    callback();
  };


  const defaultListQuery = {
    pageNum: 1,
    pageSize: 10,
    siteId: null,
    userId: null
  };

  const defaultUser = {
    selected: true,
    id: null,
    username: null,
    userType: null,
    salutation: null,
    email: null,
    name: null,
    postcode: null,
    address: null,
    unitNo: null,
    buildingName:  null,
    phone: null,
    alternateContact: null,
  };


  const defaultSeason = {
    userId: null,
    vehicheNo: null,
    iuNo: null,
    seasonType: null,
    startDatetime: null,
    siteId: null,
    payBy: null
  };
  
  
  export default {
    name: 'seasonList',
    data() {
      return {
        listQuery: Object.assign({}, defaultListQuery),
        user: Object.assign({}, defaultUser),
        season: Object.assign({}, defaultSeason),
        list: null,
        testList: {site: [{label: "test", id: 1} , {label: "park", id: 2}]},
        listLoading: false,
        total: null,
        dialogVisible: true,
        isEdit: false,
        allocDialogVisible: false,
        allocRoleIds:[],
        allRoleList:[],
        allocAdminId:null,
        value: "Selecting",
        typeValue: "select",
        salutationTypeOptions: [{
          value: 1,
          label: 'Mr.'
        }, {
          value: 2,
          label: 'Mrs.'
        }, {
          value: 3,
          label: 'Ms'
        }
        ],
        userTypeOptions: [{
          value: 1,
          label: 'Citizen.'
        }, {
          value: 2,
          label: 'Wonder.'
        }],


        rules: {
          email: [
            {required: true, message: 'Please input your username', trigger: 'blur'},
            {min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur'}
          ],
          siteId: [
            {required: true, message: 'Please input your username', trigger: 'blur'},
            {min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur'}
          ],

          userType: {required:true,  validator: checkSelection, trigger: 'blur'},
          salutation: {required: true, validator: checkSelection, trigger: 'blur'},
          name: [
            {required: true, message: 'Please input your name', trigger: 'blur'},
            {min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur'}
          ],
          postcode: {required:true,  validator: checkNumber, trigger: 'blur'},
          address: [
            {required: true, message: 'Please input your address', trigger: 'blur'},
            {min: 2, max: 1000, message: '长度在 2 到 1000 个字符', trigger: 'blur'}
          ],
          
        },
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          },
          shortcuts: [{
            text: 'Today',
            onClick(picker) {
              picker.$emit('pick', new Date());
            }
          }, {
            text: 'Yesterday',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit('pick', date);
            }
          }, {
            text: 'A week ago',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', date);
            }
          }]
        }

      }
    },
    mounted(){
      console.log("mounted");
    },
    created() {
      console.log("created");
      this.getList();
    },
    filters: {
      formatDateTime(time) {
        if (time == null || time === '') {
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
      }
    },
    computed: {
      ...mapGetters([
        'pkSite',
      ]),
    },
    methods: {
      handleResetSearch() {
        this.listQuery = Object.assign({}, defaultListQuery);
      },
      handleSearchList() {
        this.listQuery.pageNum = 1;
        this.getList();
      },
      handleSizeChange(val) {
        this.listQuery.pageNum = 1;
        this.listQuery.pageSize = val;
        this.getList();
      },
      handleCurrentChange(val) {
        this.listQuery.pageNum = val;
        this.getList();
      },
      actionRetrieve(data){
        getEmail(data).then(response => {
          const responseData = response.data
          console.log(responseData)
          this.user = Object.assign({}, responseData)
          console.log(this.user)
        }).catch(error => {
          console.log(error)
        })
        
      },
      handleRetrieve(data) {
        
        this.actionRetrieve(data);
      },
      onSubmit(formName) {
        console.log(formName)
        this.$refs[formName].validate((valid) => {
          if (valid) {
              console.log(valid)
              this.season.userId = this.user.id;
              console.log(this.season)
              saveSeason(this.season).then(response=>{
                
                  this.$message({
                    type: response.code == 200 ? 'success': 'warning',
                    message: response.message
                  });
                
              });
          } else {
            return false;
          }
        });
      },
      getList() {
        this.listLoading = true;
        /*
        listSite(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          console.log(this.list)
          this.total = response.data.total;
        });
        */
        
        this.$store.dispatch('GetSite').then(() => {
          this.loading = false;
          console.log(this.$store.state)
        }).catch(() => {
          this.loading = false
        })
      

      },
      setSelected(value)
      {
          console.log(value)
      }
    }
  }



</script>
<style></style>

