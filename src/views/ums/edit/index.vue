<template> 
  <div class="app-container">
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>1. Applicant Particulars</span>
    </el-card>

    <el-form  :model="listQuery" :rules="rules" ref="seasonForm" label-position="left" label-width="300px" size="small" style="margin: 10px">
        <el-form-item label="User ID" prop="username">
            <el-input v-model="listQuery.username" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="User Type:" prop="userType">
            <el-select v-model="listQuery.userType" placeholder="Selecting">
                <el-option
                v-for="item in userTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="Salutation:" prop="salutation">
            <el-select v-model="listQuery.salutation" placeholder="Select" clearable>
                <el-option
                v-for="item in salutationTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="Name (as in NRIC/Passport)" prop="name">
            <el-input v-model="listQuery.name" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="Post Code" prop="postcode">
            <el-input v-model="listQuery.postcode" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="Address" prop="address">
            <el-input v-model="listQuery.address" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="Unit No" prop="unitNo">
            <el-input v-model="listQuery.unitNo" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="Building Name" prop="buildingName">
            <el-input v-model="listQuery.buildingName" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="Tel No / Mobile" prop="phone">
            <el-input v-model="listQuery.phone" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="Alternate Contact No." prop="alternateContact">
            <el-input v-model="listQuery.alternateContact" style="width: 250px"></el-input>
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
  import {getInfo, fetchList,createAdmin,updateAdmin,updateUser,updateStatus,deleteAdmin,getRoleByAdmin,getCurrent,allocRole} from '@/api/login';
  
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
    keyword: null,
    username: null,
    password: null,
    nickName: null,
    email: null,
    note: null,
    status: 1,
    userType: null,
    salutation: null,
    name: null,
    postcode: null,
    address: null,
    unitNo: null,
    buildingName: null,
    phone: null,
    vehicheNo: null,
    iuNo: null,
    seasonType: null,
    startDatetime: null,
    siteId: null,
    paymentMethod: null,

  };
  
  export default {
    name: 'seasonList',
    data() {
      return {
        listQuery: Object.assign({}, defaultListQuery),
        list: null,
        total: null,
        listLoading: false,
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
      
      getCurrent().then(response => {
        const data = response.data
        this.listQuery = Object.assign({}, data)
        console.log(this.listQuery)
      }).catch(error => {
      })
      

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
      onSubmit(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
              //Start of API
              console.log(valid)
              this.$confirm('是否要确认?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                
                  updateUser(this.listQuery.id,this.listQuery).then(response => {
                    this.$message({
                      message: '修改成功！',
                      type: 'success'
                    });
                    console.log(this.listQuery)
                    
                  })
                
              })
              //End of API
          } else {

            return false;
          }
        });
      },
    }
  }



</script>
<style></style>

