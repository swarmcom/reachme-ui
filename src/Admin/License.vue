<template>
  <div class="container">
    <div
      class="row"
      style="margin-bottom: 10px"
    >
      <div class="col">
        <h3>Domain license:</h3>
      </div>
    </div>

    <b-row>
      <b-col cols="1">
        Start:
      </b-col><b-col>{{ license.start }}</b-col>
    </b-row>
    <b-row>
      <b-col cols="1">
        End:
      </b-col><b-col>{{ license.end }}</b-col>
    </b-row>
    <b-row>
      <b-col cols="1">
        Users:
      </b-col><b-col>{{ license.users }}</b-col>
    </b-row>
    <b-row>
      <b-col cols="1">
        Domain:
      </b-col><b-col>{{ license.domain }}</b-col>
    </b-row>

    <b-row style="margin-top: 20px">
      <b-col>
        <b-form-file
          v-model="license_file"
          placeholder="Choose license to upload..."
          @input="upload"
        />
      </b-col>
      <b-col>
        <button
          class="btn btn-outline-primary"
          @click="cancel"
        >
          Cancel
        </button>
        <button
          class="btn btn-outline-danger"
          @click="remove"
        >
          Delete
        </button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Common from '@/Admin/Common'

export default {
  name: 'AdminParams',
  mixins: [Common],
  data () {
    return {
      license_file: undefined,
      license_uuid: undefined,
      license: {}
    }
  },
  created () {
    this.query()
  },
  methods: {
    query: async function () {
      this.license = await this.$agent.p_mfa('ws_admin', 'get_license_data')
      this.license.start = this.validateDate(this.license.start)
      this.license.end = this.validateDate(this.license.end)
    },
    remove: async function () {
      this.license = await this.$agent.p_mfa('ws_admin', 'delete_license')
    },
    cancel: async function () {
      this.$router.go(-1)
    },
    upload: function (file) {
      let xhr = new XMLHttpRequest()
      let fd = new FormData()

      xhr.open("POST", `${this.$agent.get_api()}/upload/license`, true)
      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
          this.license_uuid = xhr.responseText
          this.$agent.mfa('ws_admin', 'license_file', [this.license_uuid], (re) => {
            if (re.reply == 'ok') {
              this.$notify({ title: 'Success:', text: 'License uploaded', type: 'success' })
              this.query()
            } else {
              this.$notify({ title: 'Error:', text: re.error, type: 'error' })
            }
          })
        }
      }
      fd.append('license', file)
      xhr.send(fd)
    },
    validateDate(value){
      if (!value) return
      let date = new Date(value)
      if(!isFinite(date)){
        return new Date("20" + value.substring(0,2) + "-" + value.substring(2,4) + "-" + value.substring(4,6) + "T" + value.substring(6,8) + ":" + value.substring(8,10) + ":" + value.substring(10,13)).toLocaleString('en-GB', { timeZone: 'UTC' }) + " UTC"
      }
      else {
        return date.toLocaleString('en-GB', { timeZone: 'UTC' }) + " UTC"
      }
    }
  }
}
</script>
