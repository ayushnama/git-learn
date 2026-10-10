import test from 'node:test'
import assert from 'node:assert/strict'
import { validateAccount, validateAddress, validateProfile, shippingCustomer, safeAccountReturn } from '../src/utils/customer.js'
import { customerService } from '../src/services/customerService.js'
import { validateCustomer } from '../src/utils/checkout.js'

test('login/signup validation rejects invalid details and mismatched passwords', () => {
  assert.equal(Object.keys(validateAccount({})).length, 2)
  assert.equal(Object.keys(validateAccount({name:' ',phone:'12',email:'x',password:'short',confirmPassword:'different'}, true)).length, 5)
  assert.deepEqual(validateAccount({name:'Ayush',phone:'9876543210',email:'ayush@example.com',password:'eightchars',confirmPassword:'eightchars'}, true), {})
})
test('profile and shipping addresses require valid mandatory fields', () => {
  assert.equal(Object.keys(validateProfile({})).length, 3)
  assert.equal(Object.keys(validateAddress({})).length, 4)
  const address = {name:'Ayush',phone:'9876543210',address:'12 Marble Road, Delhi',pincode:'110001'}
  assert.deepEqual(validateAddress(address), {})
  assert.deepEqual(validateCustomer(shippingCustomer(address,{email:'ayush@example.com'})), {})
  assert.ok(validateCustomer(shippingCustomer(null,{email:'ayush@example.com'})).address)
})
test('default adapter never invents authentication, mutations or orders', async () => {
  assert.equal(await customerService.getSession(), null)
  for (const method of ['login','signup','logout','updateProfile','getAddresses','saveAddress','deleteAddress','setDefaultAddress','getOrders','getOrder']) {
    await assert.rejects(customerService[method]({}), /not available yet/)
  }
})
test('post-login return destinations cannot redirect outside the site', () => {
  assert.equal(safeAccountReturn('/checkout'), '/checkout')
  for (const path of ['//evil.test','https://evil.test','/admin','javascript:alert(1)']) assert.equal(safeAccountReturn(path), '/account/profile')
})
