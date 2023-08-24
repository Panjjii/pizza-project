/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };
  class Product{
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initOrderForm();
      thisProduct.processOrder();
      thisProduct.initAccordion();
      console.log('New Product: ', thisProduct);
    }
    renderInMenu(){
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }
    getElements(){
      const thisProduct = this;
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    }
    initAccordion(){
      const thisProduct = this;
    /* find the clickable trigger (the element that should react to clicking) */
      thisProduct.accordionTrigger.addEventListener('click', function(event){
      /* START: add event listener to clickable trigger on event click */
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const ActiveProduct = document.querySelector(select.all.menuProductsActive);
        console.log('Active: ', ActiveProduct);
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (ActiveProduct != null && ActiveProduct != thisProduct.element){
            ActiveProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }
    initOrderForm(){
      const thisProduct = this;
      console.log('Order form:');
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }
    processOrder(){
      const thisProduct = this;
      console.log('Processing');
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);
      /* set price to default */
      let price = thisProduct.data.price;
      /* for every category (param)... */
      for (let paramID in thisProduct.data.params){
        /* determine param value, e.g. paramID = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... } */
        const param = thisProduct.data.params[paramID];
        console.log(paramID, param);
        /* for every option in this category */
        for (let optionID in param.options){
          /* determine option value, e.g. optionID = 'olives', option = { label: 'Olives', price: 2, default: true } */
          const option = param.options[optionID];
          console.log('Ingredients: ', optionID, option);
          /* if there is a param compatible with the category in formData (the same name with paramID) */
          if (formData[paramID] && formData[paramID].includes(optionID)){
            /* if the option is not default */
            if(!option.default){
              /* add proper price to let price */
              price += option.price;
            }
          } else {
            /* if the option is default */
            if(option.default) {
              /* reduce let price */
              price -= option.price;
            }
          }
          const piece = thisProduct.imageWrapper.querySelector('.' + paramID + '-' + optionID);
          if (piece){
            if (formData[paramID] && formData[paramID].includes(optionID)){
              piece.classList.add(classNames.menuProduct.imageVisible);
            } else {
              piece.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      /* update calculated price in the HTML */
      thisProduct.priceElem.innerHTML = price;
    }
  }
  const app = {
    initMenu: function(){
      const thisApp = this;
      console.log('thisAppdata: ', thisApp.data);
      for (let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },
  }
  app.init();
}