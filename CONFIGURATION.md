## CDP Web SDK - Configuration Object Structure

The Web SDK consumes this Configuration Object to automatically generate and assigns event listeners to the related DOM elements.
 
The Configuration Object structure has several attributes as indicated in the following. All the attributes except `client` are optional. 
  

```javascript
{
    client: {},
    signals: [],
    selectors: {}
    schemas: {},
    dataProviders: {},
    transforms: {},
    conditions: {}
}
```

### Client
List of CDP Client Configuration parameters are described in the following table. The parameters that are not optional needs to be provided be the user. 

| Field Name                         | Type    | Default     | Required | Description                                                                                                                                                                |
|------------------------------------|---------|-------------|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| appSourceId                        | String  |             | yes      | This value can be obtained from your CDP admin.                                                                                                                                        |
| beaconEndpoint                     | String  |             | yes      | The `beaconEndpoint` structure is `http://<Tenant Specific Endpoint>/web/events`. Refer to [this document](https://help.salesforce.com/articleView?id=sf.c360_a_tenant_specific_endpoint.htm&type=5) to find your tenant specific endpoint.                                           |
| authEndpoint                       | String  |             | yes      | The `authEndpoint` structure is `http://<Tenant Specific Endpoint>/web/authentication`. Refer to [this document](https://help.salesforce.com/articleView?id=sf.c360_a_tenant_specific_endpoint.htm&type=5) to find your tenant specific endpoint.                                     |
| deviceId                           | String  |             | no       | `deviceId` can also be defined in the client configuration if needed, otherwise the identifier created and managed by the SDK will be used.                                |
| sessionId                          | String  |             | no       | `sessionId` will be automatically populated by Web SDK and no need to be defined by the user                                                                               |
| consentEventTypeName               | String  | consent-log | no       | This parameter set the name of the Consent Event Type. The default name `consent-log` will work for most configurations.                                                   |
| retryAttempts                      | Integer | 3           | no       | This parameter is the number of retry attempts in case of failing sending events to the Beacon service.                                                                    |
| retryDelayMS                       | Integer | 3000        | no       | This parameter is the delay duration between retry attempts (milliseconds) in case of failing sending events to the Beacon service.                                        |
| automaticallyTrackNavigationEvents | Boolean | false       | no       | by enabling this flag, the Web SDK will automatically track the user page navigation events and captures   `document.location.hash`   and   ` document.location.pathname`. |

### Signals
Signals are the primary part of the configuration object the Web SDK engine will use to assign the event listeners to the appropriate page DOM element.
Signals are the primary piece of data that will need to be updated after initialization. Other configuration values such as schemas, data providers, and transformations are less likely to change.
A signal can have the following structure. The signal `name`, `schema`, and `cateogry` are mandatory fields.
```javascript
{
    name: 'signal name',
    schema: 'schemaId',
    category: 'category', // example: engagment 
    event: {
      type: 'click',
      selector: 'reference to selector name'
    },
    conditions: [
      'isProductPage'
    ],
    mapping: {
      "attribute name": {
        from: 'page',
        selector: 'reference to selector name',
        value: '#text' // or an attribute?
      },
      "attribute name": {
        from: 'data',
        provider: 'reference to data provider name',
        attribute: 'attribute name'
      }
   }
}
```

**Note**: Calling `CDP.configure` method will force all registered signals on the page to be removed before the new set of signals is registered.

### Selectors
Every selector that is referenced in the Signal section is defined here. Each selector can return one or more DOM element.

There are three types of selectors supported by the Web SDK:
1. Selectors can be composed of a CSS selector only, defining the path to a DOM element.
2. Selectors can be composed of a CSS selector and the text attribute of the last element in the path. 
3. Custom javascript can be written to implement any unique cases where a CSS selector and text matching does not provide the required functionality. 

```javascript
selectors: {
    "unique selector name": {
        selector: '<CSS selector (e.g. ul li.productName)>'
    },
    "unique selector name": {
        selector: '<CSS selector (e.g. ul li.productName)>',
        containsText: "<Text pattern to match inside the DOM Element(s).>"
    },
    "unique selector name": {
        selector: function() {
            // Creating a dynamic selector based on data from the page's data layer
            return document.getElementById("product_" + dataLayer.get('currentProductId'));
        }
    }
}
```

### Schemas
Ideally the schemas would not need to be provided by the user, rather they would be loaded from the CDP backend but that will not be possible initially.  Until that can happen the user can export their schemas and load them into the SDK for an extra layer of validation in the mapping process.

```javascript
schemas: {
    schemaId: {
      ...  
    }
  }
```

### DataProviders
Data providers represent information that cannot be captured directly from on-screen elements. They are basically functions that returns data information based on the input param.
```javascript
dataProviders: {
        functionName (param) {
            return <data based on the input param>
        }
    }
```

### Transforms
Transforms might be unnecessary for most use cases but are simple enough to support.  The basic contract would be:

* Parameters: `value` - the input value

* Returns: `transformedValue` - the output value after the transformation has occurred 

Sample transform:

```javascript
transforms: {
        toUpperCase (value) {
            return value.toUpperCase()
        }
    }
```

### Conditions
Like transforms, conditions might be unnecessary for most use cases but are simple to support.  The user would register a function signifying a specific condition to be matched for a signal to be considered “active” on a page.  

Sample condition:
```javascript
conditions: {
    isProductPage () {
      return document.querySelector('.product-view') != null
    }
  }
```
# Sample Configuration Object

```javascript
{
    signals: [
        {
            name: 'Remove from cart button',
            category: "Engagement",
            schema: 'RemoveFromCart',
            event: {
                type: 'click',
                selector: "remove from cart button selector"
            },
            providers: [
                'productCatalog'
            ],
            mapping: {
                ProductId: {
                    from: 'data',
                    provider: 'productCatalog',
                    attribute: 'ProductId'
                },
                ShoppingCartId: {
                    from: 'data',
                    provider: 'productCatalog',
                    attribute: 'ShoppingCartId'
                }
            }
        },
        {
            name: 'Add to cart button',
            schema: 'AddToCart',
            category: "Engagement",
            event: {
                type: 'click',
                selector: "add to cart button selector"
            },
            providers: [
                'productCatalog'
            ],
            mapping: {
                ProductId: {
                    from: 'data',
                    provider: 'productCatalog',
                    attribute: 'ProductId'
                },
                ShoppingCartId: {
                    from: 'data',
                    provider: 'productCatalog',
                    attribute: 'ShoppingCartId'
                }
            }
        },
        {
            name: 'Username typed',
            schema: 'usernameTyped',
            category: 'Profile',
            event: {
                type: 'keydown',
                selector: "username textbox"
            },
            mapping: {
                username: {
                    from: 'page',
                    selector: "username textbox",
                    scope: 'document'
                }
            }
        },
        {
            name: 'Product click',
            schema: 'ProductViewed',
            category: "Engagement",
            event: {
                type: 'click',
                selector: "product selectors"
            },
            providers: [
                'productCatalog'
            ],
            mapping: {
                ProductId: {
                    from: 'data',
                    provider: 'productCatalog',
                    attribute: 'ProductId'
                }
            }
        },
        {
            name: 'opt-in',
            schema: 'consent-opt-in',
            category: "Consent",
            event: {
                type: 'click',
                selector: "consent opt-in selector"
            }
        },
        {
            name: 'opt-out',
            schema: 'consent-opt-out',
            category: "Consent",
            event: {
                type: 'click',
                selector: "consent opt-out selector"
            }
        }
    ],
    dataProviders: {
        productCatalog (domEvent) {
            return {
                "ProductId": "product-id-9aba47743f27",
                "ShoppingCartId": "shopping-cart-id-9aba47743f27"
            }
        }
    },
    selectors: {
        "remove from cart button selector": {
            selector: 'body > div.wrapper.svelte-1a3asx9 > main > div > div.slds-col.slds-size_2-of-3 > div:nth-child(3) > div:nth-child(2) > div:nth-child(6) > button:nth-child(2)'
        },
        "add to cart button selector": {
            selector: 'button.slds-button.slds-button_destructive',
            containsText: "ADD"
        },
        "product selectors": {
            selector: function() {
                return document.querySelectorAll('.stencil');
            }
        },
        "consent opt-in selector": {
            selector: '#dialog-body-id-42 > a > div > p > button.slds-button.slds-button_brand'
        },
        "consent opt-out selector": {
            selector: '#dialog-body-id-42 > a > div > p > button.slds-button.slds-button_destructive'
        },
        "username textbox": {
            selector: '#username'
        }
    }
}
```


