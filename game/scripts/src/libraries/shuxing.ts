/**
 * 五行属性
 */
class WuXing {
    
//基础属性
WuXing = {
    //金
        jin:{
        gongjili:20,
        shengmingzhi:0,
        neilizhi:10,
        baojilv:1.8,
        baojishanghai:0.76,
        mingzhonglv:0.57,
        shanbilv:0.7,
        shengminghuifu:0,
        neilihuifu:0,
        xingdongli:0,
        xingdonglihuifu:0,
        sudu:10
    },   
    //木
        mu:{
        gongjili:9.6,
        shengmingzhi:14.4,
        neilizhi:9.6,
        baojilv:1.2,
        baojishanghai:0,
        mingzhonglv:0,
        shanbilv:1.7,
        shengminghuifu:1.4,
        neilihuifu:1.9,
        xingdongli:0,
        xingdonglihuifu:1.4,
        sudu:14.4
    },
    //水
        shui:{
        gongjili:0,
        shengmingzhi:19.7,
        neilizhi:17.7,
        baojilv:0,
        baojishanghai:0,
        mingzhonglv:0,
        shanbilv:1.4,
        shengminghuifu:2,
        neilihuifu:2.8,
        xingdongli:2,
        xingdonglihuifu:1,
        sudu:0
    },
    //火
        huo:{
        gongjili:11.3,
        shengmingzhi:0,
        neilizhi:0,
        baojilv:2.2,
        baojishanghai:0.94,
        mingzhonglv:0.38,
        shanbilv:0,
        shengminghuifu:0,
        neilihuifu:1.4,
        xingdongli:2.4,
        xingdonglihuifu:0,
        sudu:11.3
    },
    //土
        tu:{
        gongjili:0,
        shengmingzhi:30,
        neilizhi:0,
        baojilv:0,
        baojishanghai:0,
        mingzhonglv:0.5,
        shanbilv:0,
        shengminghuifu:1.2,
        neilihuifu:0,
        xingdongli:3,
        xingdonglihuifu:1.4,
        sudu:0
    }
}

    //CustomNetTables.SetTableValue("wu_xing", "wu_xing", WuXing);

}

export { WuXing };