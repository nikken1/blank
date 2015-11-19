// Gets URL parameters
function getUrlParams()
{
    var match,
        pl     = /\+/g,
        search = /([^&=]+)=?([^&]*)/g,
        decode = function(s){ return decodeURIComponent(s.replace(pl, " "));},
        query  = window.location.search.substring(1);

    var urlParams = {};
    while (match = search.exec(query))
    {
        urlParams[decode(match[1])] = decode(match[2]);
    }
    return urlParams;
}

// Checks if var empty
function isEmpty(variable)
{
    if ((variable == 'undefined') || (variable == '') || (variable == null))
    {
        return true;
    }
    return false;
}

// Merge two arrays w/o dupes
function mergeArrays(a, b)
{
    var hash = {};
    return a.concat(b).filter(function (val)
    {
        return hash[val] ? 0 : hash[val] = 1;
    });
}

// Converts object to array
function toArray(variable)
{
    var array = $.map(variable, function(value, index)
    {
        return [value];
    });
    return array;
}

// Converts jQuery.serializeArray data to assoc
function serialAssoc(serialized_array)
{
    var array = {};
    $.each(serialized_array, function(i, input)
    {
        if (input.name && input.value)
        {
            array[input.name] = input.value;
        }
        else
        {
            array[i] = input;
        }
    });
    return array;
}

// Checks if var is of type array
function isArray(variable)
{
    return Object.prototype.toString.call(variable) === '[object Array]';
}

// Checks for the existence of needle in haystack
function inArray(needle, haystack)
{
    return haystack.indexOf(needle) > -1;
}

// Checks arrays for equality, returns diff
Array.prototype.arrayDiff = function(a)
{
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

function numberWithCommas(x)
{
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

// Formats money
Number.prototype.formatMoney = function(c, d, t)
{
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

// Gets string between two characters
function getStringBetween(begin_char, end_char, string)
{
    return string.substring(string.lastIndexOf(begin_char) + 1, string.lastIndexOf(end_char));
}

$.fn.serializeFormJSON = function () {

    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

// Truncates a string s.trunc(5);
String.prototype.trunc = String.prototype.trunc ||
    function(n){
        return this.length>n ? this.substr(0,n-1)+'<a href="javascript:void(0);" name="' + this + '" class="title_expand">&hellip;</a>' : this;
    };

function maskCardNumber(cardnumber)
{
    if (isEmpty(cardnumber))
    {
        return false;
    }
    var asterisks = '';
    var fullength = cardnumber.length;
    var showlength = -4;
    var astlength = fullength - Math.abs(showlength);
    for (i = 0; i < astlength; i++)
    {
        asterisks += '*';
    }
    return asterisks+ cardnumber.substr(fullength, showlength);
}

// Page loading dialog
function loading()
{
    window.setTimeout(function()
    {
        $.mobile.loading('show', {
            text:'Loading',
            textonly:false,
            textVisible:true,
            theme:'e',
            html:''
        });
    }, 1);
}

// message support
function message(message)
{
    $.growl.error({
        duration:settings.messagedelay,
        close:'&#215;',
        location:'default',
        title:'',
        style:'notice',
        size:'medium',
        message:message
    });
}

// Error support
function errorMessage(message)
{
    $.growl.error({
        duration:settings.errordelay,
        close:'&#215;',
        location:'default',
        title:'',
        style:'error',
        size:'medium',
        message:message
    });
}

function startSpin(node)
{
    node = $(node);
    $(node).addClass('spinning').append('<div class="spinner" />');
}

function stopSpin(node)
{
    node = $(node);
    $(node).removeClass('spinning').find('.spinner').remove();
}

// Gets app setting(s)
function getSettings(setting)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/settings?param='+(!isEmpty(setting) ? setting : null));
    }
    var result = null;
    $.ajax({
        url: ((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/settings',
        dataType:'json',
        async:false,
        type:'get',
        data:
        {
            param:(!isEmpty(setting) ? setting : null)
        },
        success: function (response)
        {
            if (response.stat.toLowerCase() == 'ok')
            {
                result = response.message;
            }
        }
    });
    return result;
}

// Gets app mode
function getMode()
{
    return getSettings('mode');
}

// Check internet connection
function getConnection()
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/connection');
    }
    var result = false;
    $.ajax({
        url: ((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/connection',
        dataType:'json',
        async:false,
        type:'get',
        cache:false,
        success: function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                result = false;
            }
            else
            {
                result = true
            }
        },
        error: function (jq_hxr, status, error)
        {
            result = false;
			errorMessage(error);
        }
    });
    return result;
}

// Determine's if Nikken is ready
function ready()
{
    var conn = getConnection();
    if (conn === false)
    {
        errorMessage('Are you offline?');
        return false;
    }
    var mode = getMode();
    if (mode == 'disabled')
    {
        errorMessage('Nikken is in maintenance');
        return false;
    }
    return true;
}

// Gets range of dates
function getDates()
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/dates');
    }
    var result = null;
    $.ajax({
        url: ((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/dates',
        dataType:'json',
        async:false,
        type:'get',
        success: function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message, true);
            }
            else
            {
                result = response.message;
            }
        },
        error: function (jq_hxr, status, error)
        {
            errorMessage(error, true);
        }
    });
    return result;
}

// Gets range of months
function getMonths()
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/months');
    }
    var result = null;
    $.ajax({
        url: ((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/months',
        dataType:'json',
        async:false,
        type:'get',
        success: function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message, true);
            }
            else
            {
                result = response.message;
            }
        },
        error: function (jq_hxr, status, error)
        {
            errorMessage(error, true);
        }
    });
    return result;
}

// Gets range of days
function getDays(leading_zeros)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/days?lz='+leading_zeros);
    }
    var result = null;
    $.ajax({
        url: ((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/days',
        dataType:'json',
        async:false,
        type:'get',
        data:
        {
            lz:leading_zeros
        },
        success: function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message, true);
            }
            else
            {
                result = response.message;
            }
        },
        error: function (jq_hxr, status, error)
        {
            errorMessage(error, true);
        }
    });
    return result;
}

// Gets range of years
function getYears()
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/years');
    }
    var result = null;
    $.ajax({
        url: ((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/years',
        dataType:'json',
        async:false,
        type:'get',
        success: function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message, true);
            }
            else
            {
                result = response.message;
            }
        },
        error: function (jq_hxr, status, error)
        {
            errorMessage(error, true);
        }
    });
    return result;
}

// Gets range of birth years
function getBirthYears()
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/birthyears');
    }
    var result = null;
    $.ajax({
        url: ((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/birthyears',
        dataType:'json',
        async:false,
        type:'get',
        success: function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message, true);
            }
            else
            {
                result = response.message;
            }
        },
        error: function (jq_hxr, status, error)
        {
            errorMessage(error, true);
        }
    });
    return result;
}

// Gets the client IP address
function getIP()
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/ip');
    }
    var result = null;
    $.ajax({
        url: ((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/ip',
        dataType:'json',
        async:false,
        type:'get',
        success: function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message, true);
            }
            else
            {
                result = response.message;
            }
        },
        error: function (jq_hxr, status, error)
        {
            errorMessage(error, true);
        }
    });
    return result;
}

// Authenticate user
function authenticate(username, password)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/login?username='+username+'&password='+password);
    }
    var result = null;
    $.ajax({
        url: ((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/login',
        dataType:'json',
        async:false,
        cache:false,
        type:'post',
        data:
        {
            username:username,
            password:password
        },
        success: function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message, true);
            }
            else
            {
                result = response.message;
            }
        },
        error: function (jq_hxr, status, error)
        {
            errorMessage(error, true);
        }
    });
    return result;
}

// Clear user session vars
function clearSession()
{
    localStorage.setItem('username', '');
    localStorage.setItem('token', '');
    localStorage.setItem('dn', '');
    localStorage.setItem('myMkt', '');
    localStorage.setItem('catid', '');
    localStorage.setItem('cart', '');
    localStorage.setItem('cartops', '');
    localStorage.setItem('cost', '');
    localStorage.setItem('count', '');
    localStorage.setItem('total', '');
    localStorage.setItem('shipping', '');
    localStorage.setItem('ship_method', '');
    localStorage.setItem('billing', '');
    localStorage.setItem('order_number', '');
    localStorage.setItem('newdistid', '');
    localStorage.setItem('newdistpw', '');
    localStorage.setItem('preorder', '');
    localStorage.setItem('enrolldata', '');
}

// Logout user
function logout()
{
    clearSession();
    $('#userPassIn').val('');
    window.location.href = '../index.html';
}

// Gets language record for id
function getLang(lng)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/language?lng='+lng);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/language',
        dataType:'json',
        async:false,
        type:'get',
        data:
        {
            lng:lng
        },
        success:function(response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message[0];
            }
        },
        timeout:settings.ajaxtimeout,
        error:function(xqxhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

function getLanguages()
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/languages');
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/languages',
        dataType:'json',
        async:false,
        type:'get',
        success:function(response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        timeout:settings.ajaxtimeout,
        error:function(xqxhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Gets locale for country/language
function getCountryLocale(token, countryid)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/countrylocale?token='+token+'&countryid='+countryid);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/countrylocale',
        dataType:'json',
        async:false,
        type:'get',
        data:
        {
            token:token,
            countryid:countryid
        },
        success:function(response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        timeout:settings.ajaxtimeout,
        error:function(xqxhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Get localization record
function getLocalization(token, id)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/localization?token='+token+'&id='+id);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/localization',
        dataType:'json',
        async:false,
        type:'get',
        data:
        {
            token:token,
            id:id
        },
        success:function(response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        timeout:settings.ajaxtimeout,
        error:function(xqxhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Gets localizations
function getLocalizations()
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/localizations');
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/localizations',
        dataType:'json',
        async:false,
        type:'get',
        success:function(response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        timeout:settings.ajaxtimeout,
        error:function(xqxhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Gets country states and provinces
function getCountryStatesAndProvinces(country)
{
    country = getStringBetween('(', ')', country).toLowerCase();
    var result = null;
    $.ajax({
        url:'../vendor/regions/countries.json',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        success:function(response)
        {
            $.each(response, function(i, record)
            {
                if (!isEmpty(record.filename))
                {
                    if (record.name.toLowerCase() == country)
                    {
                        result = record;
                    }
                }
            });
        },
        error:function(jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    $.ajax({
        url:'../vendor/regions/countries/' + result.filename + '.json',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        success:function(response)
        {
            result = response;
        },
        error:function(jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Get country records
function getCountries(token)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/countries');
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/countries',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token
        },
        success:function(response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function(jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Gets country record
function getCountry(token, countryid)
{
    if (settings.debug == true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/country?token='+token+'&countryid='+countryid);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/country',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            countryid:countryid
        },
        success:function(response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function(jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Get metrics
function getMetrics(token, distid)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/wwmetrics?token='+token+'&distid='+distid);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/wwmetrics',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            distid:distid
        },
        success:function(response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function(jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/lmetrics?token='+token+'&distid='+distid);
    }
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/lmetrics',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            distid:distid
        },
        success:function(response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result.pv = response.message.pv;
                result.pgv = response.message.pgv;
                result.asv = response.message.asv;
                result.nc = response.message.nc;
            }
        },
        error:function(jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Gets parent categories for language
function getParentCategories(token, lng)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/categories?token='+token+'&lng='+lng);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/categories',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            lng:lng
        },
        success:function(response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function(jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Gets parent category record
function getCategory(token, lng, catid)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/category?token='+token+'&lng='+lng+'&catid='+catid);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/category',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            lng:lng,
            catid:catid
        },
        success:function(response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function(jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Gets sub categories for parent
function getSubCategories(token, lng, catid, ptype, otype)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/subcategories?token='+token+'&lng='+lng+'&catid='+catid+'&ptype='+ptype+'&otype='+otype);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/subcategories',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            lng:lng,
            catid:catid,
            ptype:ptype,
            otype:otype
        },
        success:function(response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function(jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Get product from sku
function getProduct(token, lng, sku)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/product?token='+token+'&lng='+lng+'&sku='+sku);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/product',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            lng:lng,
            sku:sku
        },
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message[0];
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

function getProductAvailDate(token, country, qty, sku)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/productdate?token='+token+'&country='+country+'&qty='+qty+'&sku='+sku);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/productdate',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            country:country,
            qty:qty,
            sku:sku
        },
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Get products for a product group
function getProducts(token, lng, groupid, autoship)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/subcategoryproducts?token='+token+'&lng='+lng+'&groupid='+groupid+'&autoship='+autoship);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/subcategoryproducts',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            lng:lng,
            groupid:groupid,
            autoship:autoship
        },
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

function getCurrency(token, lng)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/currency?token='+token+'&lng='+lng);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/currency',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            lng:lng
        },
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Gets product price for sku and price type
function getPrice(token, lng, sku, ptype)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/price?token='+token+'&lng='+lng+'&sku='+sku+'&ptype='+ptype);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/price',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            lng:lng,
            sku:sku,
            ptype:ptype
        },
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message[0];
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Get language based menu
function getMenu(lng, section, item)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/menu?lng='+lng+'&sec='+(!isEmpty(section) ? section : null)+'&item='+(!isEmpty(item) ? item : null));
    }
    var data = {
        lng:lng,
        sec:(!isEmpty(section) ? section : null),
        item:(!isEmpty(item) ? item : null)
    };
    if (isEmpty(data.item))
    {
        delete data.item;
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/menu',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:data,
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Get language based banners
function getBanners(lng)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/banners?lng='+lng);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/banners',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            lng:lng
        },
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Create shipping record
function postShipping(submission)
{
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/shipping',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'post',
        data:submission,
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Get shipping record
function getShipping(token, distid)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/shipping?token='+token+'&distid='+distid);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/shipping',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            distid:distid
        },
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Create billing record
function postBilling(submission)
{
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/billing',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'post',
        data:submission,
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Get billing record
function getBilling(token, distid)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/billing?token='+token+'&distid='+distid);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/billing',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            distid:distid
        },
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Get geo code
function geoLookup(data)
{
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/geocode',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:data,
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Get shipping type
function getShippingType(token, id)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/shippingtype?token='+token+'&id='+id);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/shippingtype',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            id:id
        },
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Get shipping types
function getShippingTypes(token, distid, country)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/shippingtypes?token='+token+'&distid='+distid+'&country='+country);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/shippingtypes',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            distid:distid,
            country:country
        },
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

function getShippingDates()
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/shippingdates');
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/shippingdates',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Create pre/post order
function order(submission)
{
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/order',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'post',
        data:submission,
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Get autoship order
function getAutoship(token, distid, orderid)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/autoship?token='+token+'&distid='+distid+'&orderid='+orderid);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/autoship',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            distid:distid,
            orderid: orderid
        },
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Gets autoship orders
function getAutoships(token, distid, countryid)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/autoships?token='+token+'&distid='+distid+'&countryid='+countryid);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/autoships',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            distid:distid,
            countryid:countryid
        },
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Get autoship invoice
function getAutoshipInvoice(token, distid, orderid)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/autoshipinv?token='+token+'&distid='+distid+'&orderid='+orderid);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/autoshipinv',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            distid:distid,
            orderid:orderid
        },
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Validates address
function validateAddress(submission)
{
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/addressvalidate',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:submission,
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Create pre/post autoship
function autoship(submission)
{
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/autoship',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'post',
        data:submission,
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

function autoshipUpdate(submission)
{
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/autoshipupdate',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'post',
        data:submission,
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

function autoshipDeleteStat(token, distid, countryid, orderid)
{
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/autoshipdelstat',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'post',
        data:
        {
            token:token,
            distid:distid,
            countryid:countryid,
            orderid:orderid
        },
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Deletes autoship order
function autoshipDelete(token, distid, countryid, orderid)
{
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/autoshipdel',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'post',
        data:
        {
            token:token,
            distid:distid,
            countryid:countryid,
            orderid:orderid
        },
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Gets enrollment record
function getEnrollment(token, distid, countryid)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/enrollment?token='+token+'&distid='+distid+'&countryid='+countryid);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/enrollment',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            distid:distid,
            countryid:countryid
        },
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Verifies enrollment sponsor
function verifySponsor(token, country, distid)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/verifysponsor?token='+token+'&country='+country+'&distid='+distid);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/verifysponsor',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            country:country,
            distid:distid
        },
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Verifies enrollment social security
function verifySS(token, distid, country, socialsec)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy)
            + '/verifysocial?token='+token+'&distid='+distid+'&country='+country+'&socialsec='+socialsec);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/verifysocial',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            distid:distid,
            country:country,
            socialsec:socialsec
        },
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Emroll user
function postEnrollment(submission)
{
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/enroll',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'post',
        data:submission,
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Updates bank information
function updateBank(submission)
{
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/bank',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'post',
        data:submission,
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Used to update password during enrollment
function updatePassword(token, distid, password)
{
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/password',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'post',
        data:
        {
            token:token,
            distid:distid,
            password:password
        },
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Get user record
function getUser(token, distid)
{
    if (settings.debug === true)
    {
        console.log(((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/user?token='+token+'&distid='+distid);
    }
    var result = null;
    $.ajax({
        url:((settings.mode == 'dev') ? settings.dproxy : settings.lproxy) + '/user',
        dataType:'json',
        timeout:settings.ajaxtimeout,
        async:false,
        type:'get',
        data:
        {
            token:token,
            distid:distid
        },
        success:function (response)
        {
            if (response.stat.toLowerCase() != 'ok')
            {
                errorMessage(response.message);
            }
            else
            {
                result = response.message;
            }
        },
        error:function (jq_xhr, status, error)
        {
            errorMessage(error);
        }
    });
    return result;
}

// Translate UI
function translate(page, lng)
{
    lng = (isEmpty(lng) ? localStorage.getItem('lang') : lng);
    if ($('div[data-role=panel]').is(':visible'))
    {
        var menu = getMenu(getLang(lng).ICU_ID.trim(), 'HB Menu');
        if (!isEmpty(menu))
        {
            $.each(menu, function(i, item)
            {
                if (!isEmpty(item) && !isEmpty(item.Item) && !isEmpty(item.Text))
                {
                    $('#' + item.Item).text(item.Text);
                }
            });
            initClicks();
        }
    }

    menu = getMenu(getLang(lng).ICU_ID.trim(), page);
    if (!isEmpty(menu))
    {
        $.each(menu, function(i, item)
        {
            if (!isEmpty(item) && !isEmpty(item.Item) && !isEmpty(item.Text))
            {
                var item_node = $('#' + item.Item);
                var span_node = item_node.siblings('span');
                if (span_node.length > 0)
                {
                    span_node.text(item.Text);
                }
                else
                {
                    item_node.html(item.Text).prop('placeholder', item.Text);
                }

            }
        });
    }

    if ($('div[data-role=footer]').is(':visible'))
    {
        menu = getMenu(getLang(lng).ICU_ID.trim(), 'Footer Menu');
        if (!isEmpty(menu))
        {
            $.each(menu, function(i, item)
            {
                if (!isEmpty(item) && !isEmpty(item.Item) && !isEmpty(item.Text))
                {
                    $('#' + item.Item).text(item.Text);
                }
            });
        }
    }
}

// Initializes click events for menus
function initClicks()
{
    $('.viewHome').on('click', function()
    {
        window.location.href = 'home.html';
    });

    $('.viewCont').on('click', function()
    {
        window.location.href = 'contact.html';
    });

    $('.viewLDash').on('click', function()
    {
        window.location.href = 'dashl.html';
    });

    $('.viewWWDash').on('click', function()
    {
        window.location.href = 'dashww.html';
    });

    $('.viewCartOpts').on('click', function()
    {
        if ($(this).hasClass('newas'))
        {
            window.location.href = 'cartopts.html?newas=1';
        }
        else
        {
            window.location.href = 'cartopts.html';
        }
    });

    $('.viewShopHome').on('click', function()
    {
        window.location.href = 'shop.html';
    });

    $('.viewOrders').on('click', function()
    {
        window.location.href = 'orders.html';
    });

    $('.viewEnrollPersonal').on('click', function()
    {
        window.location.href = 'enrollpersonal.html';
    });

    $('.viewEnrollment').on('click', function()
    {
        window.location.href = 'enrollkits.html';
    });

    $('.viewPayment').on('click', function()
    {
        window.location.href = 'enrollpayment.html';
    });

    $('.viewPacks').on('click', function()
    {
        window.location.href = 'enrollpacks.html';
    });

    $('.viewEnroll').on('click', function()
    {
        window.location.href = 'enroll.html';
    });

    $('.viewCartHome').on('click', function()
    {
        window.location.href = 'cart.html';
    });

    $('.viewShipHome').on('click', function()
    {
        if (localStorage.getItem('cart').length == 0)
        {
            return false;
        }
        window.location.href = 'shipping.html';
    });

    $('.viewBillingHome').on('click', function()
    {
        window.location.href = 'billing.html';
    });

    $('.viewReview').on('click', function()
    {
        window.location.href = 'review.html';
    });

    $('.logout').on('click', function()
    {
        logout();
    });

    $('a.external').on('click', function(e)
    {
        e.preventDefault();
        window.open($(this).prop('href'), '_system', 'location=yes');
    });
}

function markRequireds()
{
    $('input, textarea, select').filter('[required]').each(function(i, node)
    {
        var name = $(node).prop('name');
        $('input[name=' + name + '], select[name=' + name + '], textarea[name=' + name + ']').addClass('redness');
    });
}

function init()
{
    initClicks();
    $('input[type=checkbox]').on('change', function()
    {
        if ($(this).prop('checked') === true)
        {
            $('label[for=' + $(this).prop('name') + '] span').hide();
        }
    });
    markRequireds();
}

$(document).ready(function()
{
    init();
});

var settings = {
    // App mode
    //mode: 'dev',
    // Live proxy endpoint
    lproxy:'https://mobileapi.nikken.com',
    // Dev proxy endpoint
    dproxy:'https://devmobileapi.nikken.com',
    // Console debug
    debug:true
};
var backend = getSettings(null);
if (!isEmpty(backend))
{
    settings = $.extend(backend, settings);
}
if (settings.debug === true)
{
    console.log(settings);
}

var app = {
    initialize: function()
    {
        $(document).bind('mobileinit',function(){
			$.mobile.changePage.defaults.changeHash = false;
			$.mobile.hashListeningEnabled = false;
			$.mobile.pushStateEnabled = false;
			$.mobile.allowCrossDomainPages = true;
			//$.support.cors = true;
		});
        this.bindEvents();
    },
    bindEvents: function()
    {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function()
    {
		window.analytics.startTrackerWithId('UA-3112720-23');
		window.analytics.trackView('LoginPageView');
		errorMessage(windows.analytics);
        StatusBar.overlaysWebView(false);
        StatusBar.styleDefault();
		cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        window.open = cordova.InAppBrowser.open;
        app.receivedEvent('deviceready');
    },
    receivedEvent: function(id)
    {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
    }
};
app.initialize();