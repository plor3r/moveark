import { loadSync as loadEnvSync } from "https://deno.land/std/dotenv/mod.ts"
import { SuiClient, getFullnodeUrl } from "npm:@mysten/sui.js/client";

const env = loadEnvSync();
const deploy_id: string = env.MovescriptionDeployRecord;

const client = new SuiClient({
    url: getFullnodeUrl(env.Network),
});

const getSuiDynamicFields = async (
    id: string,
    dynamic_field_name: string,
) => {
    const parent_obj = await client.getObject({
        id,
        options: {
            showContent: true,
        },
    })
    const dynamic_field_key =
    // @ts-ignore
    parent_obj.data?.content?.fields[dynamic_field_name].fields.id.id ?? ''
    if (!dynamic_field_key) {
        throw new Error(`${dynamic_field_name} not found`)
    }
  
    const collection_keys = await client.getDynamicFields({
        parentId: dynamic_field_key,
    })
    const result = []
    for (const key of collection_keys.data) {
        const obj = await getSuiObject(key.objectId)
        // @ts-ignore
        const real_obj = await getSuiObject(obj.data?.content?.fields.value)
        // @ts-ignore
        result.push(real_obj.data?.content?.fields)
    }
    return result
}

const getSuiObject = (id: string) => {
    return client.getObject({
        id,
        options: {
            showContent: true,
        },
    })
}

const ticks = await getSuiDynamicFields(deploy_id, 'record')

console.log(ticks);

ticks.forEach(item => {
    console.log(item['tick']);
    console.log(item['id']['id']);
});