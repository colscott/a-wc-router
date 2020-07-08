class NestedOne extends HTMLElement {
    
    connectedCallback() {
        this.innerHTML = `
            <p>
<div code-example="Code to output links and outlet below">
    <a-router>
        <a-outlet></a-outlet>
        <a-route path="/webcomponent" element="content-web-component"></a-route>
        <a-route path="/webcomponent/import" import='/components/a-wc-router/src/test-dummy.js' element="content-web-component-import"></a-route>
        <a-route path="/nested" element="content-nested"></a-route>
        <a-route path="/content/import/webcomponent/data1/:requiredParam" element="content-params"></a-route>
        <a-route path="/webcomponent-data2/:optionalParam?"  element="content-params"></a-route>
        <a-route path="/webcomponent-data3/:atLeastOneParam+"  element="content-params"></a-route>
        <a-route path="/webcomponent-data4/:anyNumOfParam*"  element="content-params"></a-route>
        <a-route path="/webcomponent-data5/:firstParam/:secondParam"  element="content-params"></a-route>
        <a-route path="/template"><template>Hello Template</template></a-route>
        <a-route path='*'><template>catach all - route not found</template></a-route>
    </a-router>
</div>
            </p>
        `;
    }
    
    constructor() {
        super();
    }
}