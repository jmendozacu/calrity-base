<?php

class Shopgo_StyleEditor_Block_Adminhtml_System_Config_Styleeditor_Version extends Mage_Adminhtml_Block_System_Config_Form_Field
{
    protected function _getElementHtml(Varien_Data_Form_Element_Abstract $element)
    {
        return (string) Mage::helper('styleeditor')->getExtensionVersion();
    }
}
