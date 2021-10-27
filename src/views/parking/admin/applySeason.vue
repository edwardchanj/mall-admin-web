<template> 
  <div class="app-container">
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>1. Applicant Particulars</span>
    </el-card>

    <el-form  :model="user" :rules="rules" ref="seasonForm" label-position="left" label-width="300px" size="small" style="margin: 10px">
        <el-form-item label="User ID" prop="username">
            <el-input v-model="user.username" style="width: 250px"></el-input>
            <el-button type="primary" size="small" @click="handleRetrieve(user.username)">Retrieve</el-button>
        </el-form-item>
        <el-form-item label="User Type:" prop="userType">
            <el-select v-model="user.userType" placeholder="Selecting">
                <el-option
                v-for="item in userTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="Salutation:" prop="salutation">
            <el-select v-model="user.salutation" placeholder="Select" clearable>
                <el-option
                v-for="item in salutationTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="Name (as in NRIC/Passport)" prop="name">
            <el-input v-model="user.name" style="width: 250px" disabled></el-input>
        </el-form-item>
        <el-form-item label="Post Code" prop="postcode">
            <el-input v-model="user.postcode" style="width: 250px" disabled></el-input>
        </el-form-item>
        <el-form-item label="Address" prop="address">
            <el-input v-model="user.address" style="width: 250px" disabled></el-input>
        </el-form-item>
        <el-form-item label="Unit No" prop="unitNo">
            <el-input v-model="user.unitNo" style="width: 250px" disabled></el-input>
        </el-form-item>
        <el-form-item label="Building Name" prop="buildingName">
            <el-input v-model="user.buildingName" style="width: 250px" disabled></el-input>
        </el-form-item>
        <el-form-item label="Tel No / Mobile" prop="phone">
            <el-input v-model="user.phone" style="width: 250px" disabled></el-input>
        </el-form-item>
        <el-form-item label="Alternate Contact No." prop="alternateContact">
            <el-input v-model="user.alternateContact" style="width: 250px" disabled></el-input>
        </el-form-item>
    
    </el-form>

    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>2. Vehicle Particulars</span>
    </el-card>

    <el-form :model="season" :rules="rules" ref="season2Form" label-position="left" label-width="300px" size="small" style="margin: 10px">
        <el-form-item label="Vehicle Registration No." prop="vehicheNo">
            <el-input v-model="season.vehicheNo" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="temp" prop="iuNo">
            <span slot="label">IU Vehicle Unit (IU) No. <br /> (10 digits below barcode, left hand side of unit)</span>
            <el-input v-model="season.iuNo" style="width: 250px"></el-input>
        </el-form-item>

    </el-form>


    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>3. Allocation of Season Parking</span>
    </el-card>

    <el-form :model="season" :rules="rules" ref="season3Form" label-position="left" label-width="300px" size="small" style="margin: 10px">
        <el-form-item label="Season: " prop="seasonType">
            <template>
              <el-radio v-model="season.seasonType" label=1>Monthly Season</el-radio>
              <el-radio v-model="season.seasonType" label=2>Daily Season</el-radio>
            </template>
        </el-form-item>
        <el-form-item label="Season Start date" prop="startDatetime">
            <el-date-picker
              v-model="season.startDatetime"
              type="date"
              placeholder="Pick a day"
              :picker-options="pickerOptions">
            </el-date-picker>
        </el-form-item>

        <div class="table-container">
          <el-table ref="adminTable"
                    :data="list"
                    
                    v-loading="listLoading" border>
            <el-table-column label="Site" align="center">
              <template slot-scope="scope">
                <el-radio v-model="season.siteId" :label="scope.row.id">{{scope.row.name}}</el-radio>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="">
          <el-pagination
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            layout="total, sizes,prev, pager, next,jumper"
            :current-page.sync="listQuery.pageNum"
            :page-size="listQuery.pageSize"
            :page-sizes="[10,15,20]"
            :total="total">
          </el-pagination>
        </div>

    </el-form>

    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>4. Payment Information</span>
    </el-card>

    <el-form :model="season" :rules="rules" ref="season4Form" label-position="left" label-width="300px" size="small" style="margin: 10px">
        <el-form-item label="Payment Method: " prop="payBy">
            <template>
              <el-radio v-model="season.payBy" label=1>Giro</el-radio>
              <el-radio v-model="season.payBy" label=2>Other</el-radio>
            </template>
        </el-form-item>

    </el-form>

    <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false" size="small">取 消</el-button>
    <el-button type="primary" @click="onSubmit('seasonForm')" size="small">确 定</el-button>
    </span>




  </div>
</template>
<script>


  import { mapGetters } from 'vuex'
  import {getInfo, fetchList,createAdmin,updateAdmin,updateUser,updateStatus,deleteAdmin,getRoleByAdmin,getCurrent,getEmail,allocRole} from '@/api/login';
  import {listSite, saveSeason} from '@/api/parking';
  
  import {fetchAllRoleList} from '@/api/role';
  import {formatDate} from '@/utils/date';

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
    keyword: null
  };

  const defaultUser = {
    id: null,
    username: null,
    userType: null,
    salutation: null,
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
          username: [
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
        listSite(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
        });
      }

    }
  }



</script>
<style></style>

