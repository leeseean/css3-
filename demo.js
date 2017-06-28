let horses = [...document.querySelectorAll('.horse')];
let horseWrap = document.querySelector('.horseWrap');
let horseSky = document.querySelector('.horseSky');
let horseOrders = document.querySelector('.horseOrders');
let horseOrderArr = [...document.querySelectorAll('.horseOrders .horseOrder')];
let horseWrapLeftValue;
let horseSkyLeftValue;
let horseLineLeft = document.querySelector('.horseLineLeft');
let horseLineRight = document.querySelector(' .horseLineRight');
let horseQuan = document.querySelector(' .horseQuan');
let horseQuanRightValue;
let horseLineRightValue;
let horseLineLeftValue;
let horseOrdersLeftValue;
let horseNumElems = [...document.querySelectorAll('.rangeNums>div>i.horseNum')];//排序马匹
let totalDistance = 600;//总共要跑的距离 草地宽度800-马身120-终点线距离右边75
let duration = [35.0,37,39,...Array(7).fill(1).map(()=>40*(randomBetween(1.1,1.3))).sort()];//预先设定每匹马要跑的时间
let openData = [8,4,5,6,1,3,2,7,9,10];//从后台传回的开奖结果
let openResult = new Object();//声明一个对象来存储openData和duration的对应关系
openData.forEach((item,index)=>{//openData和duration对应
    openResult[`horse_${item}`] = duration[index];
});
function horseInit(horses,horseOrders){//初始位置
    horses.forEach((horse,index)=>{
        horse.style.backgroundImage = `url(./horse_${index+1}_a.png)`;
        horse.style.backgroundSize = '512px';
        horse.style.top = `${38+index*29}px`;
        horse.style.left = '-95px';//一开始的位置
    });
    horseOrderArr.forEach((order,i)=>{
        order.style.top = `${15+i*29.15}px`;
    });
    horseLineLeftValue = 40;//css里面的值
    horseLineRightValue = -85;//css里面的值 终点线
    horseOrdersLeftValue = 65;//css里面的值
    horseQuanRightValue = -160;//css里面的值终点上角圈圈
    horseWrapLeftValue = 0;//运动的云朵和草地初始背景位置为0
    horseSkyLeftValue = 0;//运动的云朵和草地初始背景位置为0
}
function horseRun(horses){//马跑的动作函数
    horses.forEach((horse,index)=>{
        horse.style.animation = `horse_run infinite 450ms forwards step-start`;
    });
}
/*把路程分成3段，每段的速度不一样，可中慢快，中快慢，慢快中，慢中快，快慢中，快中慢六种随机一种;
 * 把时间分成三段，[[0.35,0.5,0.15],[0.35,0.15,0.5],[0.5,0.35,0.15],[0.5,0.15,0.35],[0.15,0.5,0.35],[0.15,0.35,0.5]]六种;
 * */

let timeMaps= [[0.35,0.45,0.2],[0.35,0.2,0.45],[0.45,0.2,0.35],[0.45,0.35,0.2],[0.2,0.45,0.35],[0.2,0.35,0.45]];
function createTimeMap(horses,timeMaps){//随机每匹马的时间分配
    let timeObj = new Object();
    horses.forEach((horse,index)=>{
        timeObj[horse.id] = timeMaps[Math.floor(randomBetween(0,6))];
    });
    return timeObj;
}
function horseMove(horses,speeds = {},leftValue = {},total = totalDistance){//赛马
    horseRun(horses);
    let timeMap = createTimeMap(horses,timeMaps);
    let timeout = null;

    function move(){
        let horsesLefts = getHorsesLeft(horses);
        horses.forEach((horse,index)=>{
            if(parseInt(horsesLefts[horse.id])<total/3){//分三段，第一段的速度
                speeds[horse.id] = (total/3)/(openResult[horse.id]*(timeMap[horse.id][0])*16);//第一段占总时间35%，写死
            }else if(parseInt(horsesLefts[horse.id])>=total/3&&parseInt(horsesLefts[horse.id])<total*2/3){//第二段的速度
                speeds[horse.id] = (total/3)/(openResult[horse.id]*(timeMap[horse.id][1])*16);//第二段占总时间50%，写死
            }else if(parseInt(horsesLefts[horse.id])>=total*2/3){//第三段的速度
                speeds[horse.id] = (total/3)/(openResult[horse.id]*(timeMap[horse.id][2])*16);//第三段占总时间15%，写死
            }
            leftValue[horse.id] = leftValue[horse.id] || 0;
            leftValue[horse.id] += speeds[horse.id];
            horse.style.left = `${leftValue[horse.id]}px`;
        });
        let speedMin = Math.min(...Object.values(speeds));
        let speedMax = Math.max(...Object.values(speeds));
        let leftMax = Math.max(...Object.values(horsesLefts).map(value=>parseInt(value)));
        let horsesLeftsKeys = Object.keys(horsesLefts);//马的id数组,马排序
        let horsesLeftsValues = Object.values(horsesLefts);//马的距离数组
        let sort_horsesLeftsValues = horsesLeftsValues.sort();//按跑动距离从小道大排序后的数组
        let sort_horsesLeftKeys = sort_horsesLeftsValues.map((value)=>getKeyFromValue(horsesLefts,value));//horseid排序
        if(!JSON.parse(sessionStorage.getItem('sort_horsesLeftKeys'))||JSON.parse(sessionStorage.getItem('sort_horsesLeftKeys')).toString()!=sort_horsesLeftKeys.toString()){
            sortHorseRange(horseNumElems,horsesLefts,sort_horsesLeftsValues);//底部实时排名,排名发生改变时重新排名。
        }
        sessionStorage.setItem('sort_horsesLeftKeys',JSON.stringify(sort_horsesLeftKeys));//把旧的排名存起来，和之后的排名做比较
        horseWrapLeftValue -= 30;//背景切换速度
        horseSkyLeftValue -= 10;//天空移动速度 
        if(leftMax>totalDistance){ //totalDistance665
            // return;
        }
        if(horseLineLeftValue>-20){
            horseLineLeftValue -= 10;
            horseLineLeft.style.left = `${horseLineLeftValue}px`;//左边起跑线向左运动。出屏幕后不再递减
        }
        if(horseOrdersLeftValue>-50){
            horseOrdersLeftValue -= 10;
            horseOrders.style.left = `${horseOrdersLeftValue}px`;//起跑线旁边向左运动。出屏幕后不再递减
        }
        if(totalDistance-leftMax<150){//倒数50米出现终点线和圈圈
            if(horseLineRightValue>=75){
                horseWrapLeftValue += 30;//终点线出现后场地不动
            }else{
                horseLineRightValue+=5;
                horseLineRight.style.right = `${horseLineRightValue}px`;
            }
            if(horseQuanRightValue>=0){

            }else{
                horseQuanRightValue+=5;
                horseQuan.style.right = `${horseQuanRightValue}px`;
            }
        }
        horseWrap.style.backgroundPosition = `${horseWrapLeftValue}px 0`;//背景跟着动
        horseSky.style.backgroundPosition = `${horseSkyLeftValue}px 0`;//天空跟着动
        timeout = setTimeout(move,1000/16);
    }
    move();
}
horseInit(horses);//初始位置
horseMove(horses);//启动


function getHorsesLeft(horses){//获取每匹马的left值,即跑的距离
    let horsesLefts = new Object();
    horses.forEach(horse=>horsesLefts[horse.id] = window.getComputedStyle(horse).left);
    return horsesLefts;
}


//底部实时排名函数
function sortHorseRange(horseNumElems,horsesLefts,sort_horsesLeftsValues){
    horseNumElems.forEach((numElem,index)=>{
        numElem.innerText = getKeyFromValue(horsesLefts,sort_horsesLeftsValues[index]).split('_')[1];
    });
}
//工具函数
function randomBetween(a,b){//获取两个数之间的随机数
    return Math.random()*(b-a)+a;
}
function getKeyFromValue(obj,value){//通过对象的value值查找与其映射的key值,对象有相同value值的话只检索第一个
    let objArr = Object.keys(obj).map((item,index)=>{//{a:1}->[{_key:'a',_value:1}]
        return {'_key':item,'_value':obj[item]};
    });
    return objArr.find((k,i)=>k['_value'] == value)['_key'];
}
/*function createSpeed(){//随机生成跑步速度
 return Array(8).fill(1).map(()=>(randomBetween(0.7,1)*5));
 }*/