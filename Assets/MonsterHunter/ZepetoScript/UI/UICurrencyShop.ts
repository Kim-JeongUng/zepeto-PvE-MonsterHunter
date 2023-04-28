import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
import {Button, Text} from 'UnityEngine.UI'
import {WaitUntil, GameObject} from 'UnityEngine'
import {CurrencyService} from "ZEPETO.Currency";
import {CurrencyPackageUnitRecord, ProductRecord, ProductService, ProductType} from "ZEPETO.Product";
import ITM_ShopProduct from '../../../Zepeto Product Module/ZepetoScript/UI/ITM_ShopProduct'

export default class UICurrencyShop extends ZepetoScriptBehaviour {
    @SerializeField() private possessionCurrencyTxt : Text;
    @SerializeField() private shopProducts : GameObject[];

    private _products : ProductRecord[];

    private Start() {
        this.StartCoroutine(this.RefreshZemUI());
        this.StartCoroutine(this.RefreshProducts());

        ProductService.OnPurchaseCompleted.AddListener((productRecord, response)=>{
            this.StartCoroutine(this.RefreshZemUI());
        });
    }

    private * RefreshZemUI(){
        const request = CurrencyService.GetUserCurrencyBalanceAsync("energy");

        yield new WaitUntil(()=>request.keepWaiting == false);
        if(request.responseData.isSuccess) {
            const quantity:bigint = request.responseData?.currency?.quantity ?? 0n;
            this.possessionCurrencyTxt.text = quantity.toString();
        }
    }

    private * RefreshProducts(){
        const request = ProductService.GetProductsAsync();
        yield new WaitUntil(()=>request.keepWaiting == false);

        if (!request.responseData || !request.responseData.isSuccess) {
            console.warn("Refresh Products Failed");
            return;
        }

        let currencyPackageIndex = 0;
        for (const product of request.responseData.products || []) {
            if (product.ProductType === ProductType.Item && currencyPackageIndex < this.shopProducts.length) {
                this.shopProducts[currencyPackageIndex].GetComponent<ITM_ShopProduct>().RefreshProduct(product);
                currencyPackageIndex++;
            }
        }
    }
}
