'use strict';
console.log('hi');
$('#form').hide();
$('#btn').on('click',function(){
  $('#form').toggle();
  $('#btn').hide();



})